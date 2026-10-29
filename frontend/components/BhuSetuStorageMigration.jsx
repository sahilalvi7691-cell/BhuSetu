"use client";

import { useState } from "react";

function migrateStorage() {
  if (typeof window === "undefined") return;

  const keys = Array.from({ length: window.localStorage.length }, (_, index) =>
    window.localStorage.key(index)
  ).filter(Boolean);

  keys.forEach((key) => {
    const value = window.localStorage.getItem(key);
    if (value === null) return;

    const nextKey = key.replace(/bhoomi/gi, "bhusetu");
    const nextValue = value.replace(/bhoomi/gi, "BhuSetu");

    if (nextKey !== key) {
      if (window.localStorage.getItem(nextKey) === null) {
        window.localStorage.setItem(nextKey, nextValue);
      }
      window.localStorage.removeItem(key);
    } else if (nextValue !== value) {
      window.localStorage.setItem(key, nextValue);
    }
  });
}

export default function BhuSetuStorageMigration({ children }) {
  useState(migrateStorage);
  return children;
}