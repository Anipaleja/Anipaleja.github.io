import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPostsMeta, getPostBySlug } from "@/lib/blog";

type PostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return getAllPostsMeta().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Post Not Found | Anish Paleja",
    };
  }

  return {
    title: `${post.title} | Anish Paleja`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  return (
    <main className="section-shell py-16">
      <Link
        href="/blog"
        className="inline-block border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-1 text-sm font-semibold text-[var(--text)]"
      >
        ← Back to blog
      </Link>

      <article className="grain-surface mt-6 p-8 md:p-10">
        <p className="eyebrow">{post.date}</p>
        <h1 className="display-lg mt-2">{post.title}</h1>
        <div className="mt-8 markdown-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>
    </main>
  );
}
