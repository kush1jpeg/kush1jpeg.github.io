---
title: "How are search engines so fast?"
description: "Discover how the apache lucene engine works so fast? inverted indexing? wats relevant scoring? the BM25 algo? field boosting?"
publishDate: "7 Sept 2026"
coverImage:
   src: "./inv.png"
   alt: "coverPage"
tags: ["database" , "backend" ]
---

u have big dreams,
even bigger aspirations and
a small startup operating out of your mother's inherited home,
exactly 0 users for this dumb saas of yours,
anyways u want to make it scalable for the future...... so that it can handle fast read operations, and your users never spend their dime-worthy of a life waiting...because u are good in backend design u choose elastic search instead of a simple mongo/pg-query like your neighbour Stanley -

```sh
# returns comments including this particular searchTerm
select id,username,region,sentiment from comments where
comment ILIKE ${"%" + searchTerm + "%"};
```

this query even though postgres supports full-text search takes quadrillion nano-seconds to execute - children don't be like Stanley, the savior is -

### Elastic Search.
its fast, blazingly enough to be used by netflix, uber, etc:
- typo tolerance
- partial matches
- relevance ranking
- autocomplete
- search inside long descriptions
- millions of records
- analytics

Elastic Search is built specifically for these problem.

we will be diving a little deep into the internals of elastic search, trying to go beyond the docs.

#### Inverted Indexing
the whole reason of this speed is the way elastic indexes the documents, it would be clear with a simple example-

these 3 sentences when inverted-ly indexed gives u the following structure-

```sh
D1: "cats drink milk"
D2: "dogs drink cold milk"
D3: "cats chase dogs"

#after indexing
cats  -> [D1, D3]
drink -> [D1, D2]
milk  -> [D1, D2]
dogs  -> [D2, D3]
cold -> [D2]
chase -> [D3]
```

- There are different ways of choosing the index, the above being the most simple.

  In advanced search engines, the words are tokenized based on a strategy(at space, at newline, take multiple word as a token), then they are converted to lowercase after removing punctuation, do   stemming(find the root word -> remove the suffix/prefix based on some rules) and finally remove the most common words(is,am,are,the) as they are just noise, then the indexes are made;

  eg-  ![diag1](/assets/db/diag1.png)


- term frequency(no of times a word appears), position, offset are used to store additional information to answer proximity queries, highlight the word based on offset value.
eg- 
```sh
D1: "the quick brown fox jumps"
D2: "the quick fox jumps over brown grass"
D3: "brown quick fox"

fox → {
    D1: tf=1, positions=[3]
    D2: tf=1, positions=[2]
    D3: tf=1, positions=[2]
}
quick → {
    D1: tf=1, positions=[1]
    D2: tf=1, positions=[1]
    D3: tf=1, positions=[1]
}
```

and if u search for "quick fox" then after comparing indexes on word quick and the word fox, returns the D2,D3 sentence as the proximity of both the words coming together is the maximum;

#### Immutability and 'lock free segments' 

- The engines compromise a little space for faster read-side working; no segment/token is ever deleted, updates and deletes don't touch existing segments; an "update" is actually a delete-marker plus a fresh insert into a new segment, and a "delete" just flags the old document as removed in a .liv (live docs) file without rewriting anything, because of this mechanism readers never require a lock,

#### Segment merging

The immutability above has an obvious cost: over time you accumulate hundreds of tiny segments, each of which a query has to check individually, and "deleted" documents keep taking up disk space until something cleans them out. Lucene periodically picks several segments, combines them into one larger segment, and physically drops any documents flagged as deleted in the process

#### The translog

newly indexed documents live in an in-memory buffer before Lucene ever writes them to a segment on disk (this is also why the refresh interval exists - 1s). If the node crashed right now, that buffer's contents would simply be gone, for which we use the translog- which acts as  a wal(Write ahead log), every indexing operation is appended to it before it's acknowledged back to the client, independent of whether it's made it into a searchable Lucene segment yet. On a crash, ES replays the translog

### Typo-tolerance
Lucene doesn't brute-force compare your typo'd search term against every term in the index.
The term dictionary is stored as an FST (Finite State Transducer) in a simple search engine, a compressed, trie-like structure where shared prefixes across terms are stored once.
and uses Levenshtein distance to find and return the result lazily;

### BM25
BM25 (Best Matching 25) is a ranking algorithm used by search engines to estimate how relevant a document is to a user's query, default to elastic-search, solr and lucene;

```sh
D1: "organic brown sugar, sugar-free options also available for baking"
D2: "sugar sugar sugar sugar sugar"
D3: "buy sugar"
```

Inside a corpus of a general store, with "sugar" as its search term ; and u have no way to find out the relevancy of the result returned;
The natural next step is TF-IDF(term frequency–inverse document frequency), multiplying two quantities:

- Term Frequency (TF): how many times the query term appears in the document
- Inverse Document Frequency (IDF): a measure of how rare the term is across the corpus

a document that mentions sugar more is probable to have better output than one that mentions it once, the stopwords(is,am,are,the) are noise and are gracefully removed.

the problems with it were - 
- gives the relevant result based on only the frequency of the search term => greater the occurence - more relevant a doc is according to it;
- it has no context of document length, a 50word document is competing in the same field as a 20pg essay;

i will not go into the mathematical details of the algorithm, but the bm25 solves the two listed problems, above.

[check in detail here ->](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables)


sayonara for now....i know its been a long time since i learned and documented something, will meet soon...and i know it was a short-ass article.
