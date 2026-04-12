import { about, personal, skills } from "@/lib/content";

export function About() {
  return (
    <section id="about" className="section-shell py-14 md:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div className="grain-surface p-6 sm:p-8 md:p-12">
          <p className="eyebrow">About</p>
          <h2 className="display-lg mt-2 max-w-lg">Building at the edges.</h2>
          <p className="mt-5 whitespace-pre-line text-[0.98rem] text-[var(--text)] sm:mt-6 sm:text-[1.03rem]">
            {about}
          </p>

          <div className="mt-7 sm:mt-8">
            <p className="eyebrow">Currently</p>
            <ul className="mt-2 space-y-2 text-[var(--text)]">
              {personal.currently.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4 pt-2 lg:pt-12">
          {Object.entries(skills).map(([group, values], index) => (
            <div
              key={group}
              className={`warm-card p-5 ${index % 2 ? "lg:ml-10" : "lg:-ml-4"}`}
            >
              <p className="eyebrow">{group}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {values.map((value) => (
                  <span
                    key={value}
                    className="border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-1 text-sm font-semibold text-[var(--text)]"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
