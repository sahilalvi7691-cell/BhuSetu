"use client";

import { Header } from "@/app/component/layout/index";
import SettingsPanel from "@/components/SettingsPanel";

export default function Page() {
  return (
    <>
      <Header title="Settings" />
      <SettingsPanel role="project-officer" title="Settings" />
    </>
  );
}
