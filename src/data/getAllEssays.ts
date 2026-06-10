import { type CollectionEntry, getCollection } from "astro:content";

export async function getAllEssays(): Promise<CollectionEntry<"essays">[]> {
  return await getCollection("essays", ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });
}
