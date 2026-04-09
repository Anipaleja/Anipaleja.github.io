import Link from "next/link";
import { getAllPostsMeta } from "@/lib/blog";

export default function BlogPage() {
  const posts = getAllPostsMeta();

  return (
    <main className="section-shell py-16">
      <div className="grain-surface p-8 md:p-10">
        <p className="eyebrow">Blog</p>
        <h1 className="display-lg mt-2">Tech notes in markdown.</h1>
        <p className="mt-4 text-[var(--text)]">
          Every post in this section is file-based markdown from the repository.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="warm-card block p-6">
            <p className="eyebrow border-b-2 border-[var(--line)] pb-2 text-[var(--text)]">{post.date}</p>
            <h2 className="mt-2 text-3xl leading-tight transition-colors hover:text-[var(--accent)]">{post.title}</h2>
            <p className="mt-3 text-[var(--text)]">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-2 border-[var(--line)] bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
