"use client";

import { useMemo, useState } from "react";
import { projects } from "@/lib/content";

const allCategories = ["All", ...Array.from(new Set(projects.map((item) => item.category)))];

const sizeClasses = {
  short: "min-h-[240px]",
  medium: "min-h-[320px]",
  tall: "min-h-[400px]",
};

export function Work() {
  const [activeCategory, setActiveCategory] = useState("All");
  const visibleProjects = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory]
  );

  return (
    <section id="work" className="section-shell py-20">
      <div className="md:ml-24">
        <p className="eyebrow">Selected Work</p>
        <h2 className="display-lg mt-3 max-w-2xl">Systems worth shipping.</h2>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 md:ml-12">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`border-2 border-[var(--line)] px-4 py-1 text-sm font-semibold uppercase transition ${
              activeCategory === category
                ? "bg-[var(--accent)] text-[#f7f7f2]"
                : "bg-[#f7f7f2] text-[var(--text)]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-10 columns-1 gap-6 md:columns-2">
        {visibleProjects.map((project, index) => (
          <article
            key={project.name}
            className={`warm-card grain-surface mb-6 break-inside-avoid p-6 ${
              sizeClasses[project.size]
            } ${index % 2 ? "md:-ml-6" : "md:ml-8"}`}
          >
            <p className="eyebrow">{project.category}</p>
            <h3 className="mt-2 text-3xl">{project.name}</h3>
            <p className="mt-3 text-sm text-[var(--text)]">{project.description}</p>
            <p className="mt-4 border-t-2 border-dashed border-[var(--line)] pt-3 text-xs font-semibold tracking-wide text-[var(--text)]">
              {project.stack}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--line)] bg-[#f7f7f2] px-2 py-1 font-mono text-xs text-[var(--text)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold uppercase text-[var(--accent)]">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
