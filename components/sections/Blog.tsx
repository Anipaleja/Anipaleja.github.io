import { blogPosts } from "@/lib/content";

export function Blog() {
  return (
    <section id="blog" className="section-shell py-20">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="eyebrow">Writing</p>
          <h2 className="display-lg mt-3">Notes from the frontier.</h2>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {blogPosts.map((post, index) => (
          <a
            key={post.title}
            href={post.link}
            target="_blank"
            rel="noreferrer"
            className={`warm-card p-7 ${index % 2 ? "lg:mt-10" : ""}`}
          >
            <p className="eyebrow border-b-2 border-[var(--line)] pb-2 text-[var(--text)]">{post.date}</p>
            <h3 className="mt-2 text-3xl leading-tight transition-colors hover:text-[var(--accent)]">
              {post.title}
            </h3>
            <p className="mt-4 text-[var(--text)]">{post.excerpt}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-2 border-[var(--line)] bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
