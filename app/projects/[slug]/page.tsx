import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, projects } from "@/lib/content";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: "Project Not Found | Anish Paleja",
    };
  }

  return {
    title: `${project.name} | Anish Paleja`,
    description: project.description,
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="section-shell py-16">
      <Link
        href="/#work"
        className="inline-block border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-1 text-sm font-semibold text-[var(--text)]"
      >
        ← Back to work
      </Link>

      <article className="grain-surface mt-6 p-6 md:p-10">
        <p className="eyebrow">{project.category}</p>
        <h1 className="display-lg mt-2">{project.name}</h1>
        <p className="mt-5 max-w-3xl text-[var(--text)]">{project.description}</p>

        <section className="mt-8">
          <h2 className="text-2xl">Tech stack</h2>
          <p className="mt-2 text-[var(--text)]">{project.stack}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-1 text-xs font-semibold text-[var(--text)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl">What I learned</h2>
          <ul className="mt-3 space-y-2 text-[var(--text)]">
            {project.learnings.map((learning) => (
              <li key={learning}>- {learning}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl">Links</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold uppercase text-[var(--accent)]">
            {project.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
