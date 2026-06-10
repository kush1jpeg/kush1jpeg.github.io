import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { siteConfig } from "@/site.config";

export const GET = async () => {
  const projects = await getCollection("projects");

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: import.meta.env.SITE,
    items: projects.map((project) => ({
      title: project.data.title,
      pubDate: project.data.publishDate,
      link: `projects/${project.id}/`,
    })),
  });
};
