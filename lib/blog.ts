import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content/blog");

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
};

export type BlogPost = BlogPostMeta & {
  contentHtml: string;
};

function isMarkdownFile(fileName: string): boolean {
  return fileName.endsWith(".md") || fileName.endsWith(".mdx");
}

function parsePostMeta(slug: string, fileContents: string): BlogPostMeta {
  const { data } = matter(fileContents);

  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? "1970-01-01"),
    excerpt: String(data.excerpt ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
  };
}

export function getAllPostsMeta(): BlogPostMeta[] {
  const fileNames = fs.readdirSync(postsDirectory).filter(isMarkdownFile);

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx?$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    return parsePostMeta(slug, fileContents);
  });

  return posts.sort((left, right) => (left.date < right.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { content } = matter(fileContents);
  const meta = parsePostMeta(slug, fileContents);

  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return {
    ...meta,
    contentHtml,
  };
}
