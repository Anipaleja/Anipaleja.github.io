"use client";

import { useEffect, useState } from "react";

export function CursorDot() {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => setPoint({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return <span className="cursor-dot hidden md:block" style={{ left: point.x, top: point.y }} />;
}
