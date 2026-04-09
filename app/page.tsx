import { About } from "@/components/sections/About";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";
import { DinoGame } from "@/components/sections/DinoGame";
import { Hero } from "@/components/sections/Hero";
import { WhatImWorkingOn } from "@/components/sections/WhatImWorkingOn";
import { Work } from "@/components/sections/Work";
import { SectionDivider } from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <SectionDivider flip />
        <Work />
        <SectionDivider />
        <About />
        <WhatImWorkingOn />
        <SectionDivider flip />
        <Blog />
        <SectionDivider />
        <DinoGame />
        <SectionDivider />
        <Contact />
      </main>
    </>
  );
}
