"use client";

import dynamic from "next/dynamic";

const ProjectMap = dynamic(() => import("./map-client"), { ssr: false });

export default function ProjectMapPage() {
  return <ProjectMap />;
}