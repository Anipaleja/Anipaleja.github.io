import { About } from "@/components/sections/About";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { WhatImWorkingOn } from "@/components/sections/WhatImWorkingOn";
import { Work } from "@/components/sections/Work";
import { AnimatedNav } from "@/components/ui/AnimatedNav";
import { CursorDot } from "@/components/ui/CursorDot";
import { SectionDivider } from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <>
      <CursorDot />
      <AnimatedNav />
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
        <Contact />
      </main>
    </>
  );
}
