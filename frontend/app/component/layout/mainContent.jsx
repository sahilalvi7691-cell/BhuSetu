"use client";
import { useLayout } from "./layoutContext";

export default function MainContent({ children, className = "" }) {
  const { isCollapsed } = useLayout();

  return (
    <main
      className={`flex-1 transition-all duration-300 ${
        isCollapsed ? 'ml-0 md:ml-20' : 'md:ml-64'
      }`}
    >
      {children}
    </main>
  );
}