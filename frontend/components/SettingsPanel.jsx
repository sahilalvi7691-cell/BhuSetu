"use client";

import { useEffect, useState } from "react";
import { Bell, Globe, Layers3, LogOut, MapPinned, Settings2 } from "lucide-react";
import { getSettingsForRole, setSettingsForRole, subscribeToSettings } from "@/components/settingsStore";

export default function SettingsPanel({ role = "project-officer", title = "Settings" }) {
  const [settings, setSettings] = useState(() => getSettingsForRole(role));

  useEffect(() => {
    const sync = (next) => setSettings(next);
    const unsubscribe = subscribeToSettings(role, sync);
    setSettings(getSettingsForRole(role));

    return unsubscribe;
  }, [role]);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setSettingsForRole(role, next);
      return next;
    });
  };

  return (
    <div className="bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-5xl px-2 pb-6 pt-2 sm:px-3 lg:px-4">
        <div className="mb-3">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-500">System</p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700">
                <Bell className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-500">Notifications</p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-900">Preferences</h2>
              </div>
            </div>

            <div className="mt-2.5 space-y-2">
              {[
                ["inAppNotifications", "In-app Notifications"],
                ["emailNotifications", "Email Notifications"],
                ["riskAlerts", "Risk Alerts"],
                ["interventionReminders", "Intervention Reminders"],
                ["projectUpdates", "Project Updates"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <span className="text-xs font-medium text-slate-700">{label}</span>
                  <button
                    type="button"
                    onClick={() => updateSetting(key, !settings[key])}
                    aria-label={`Toggle ${label}`}
                    className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition ${
                      settings[key] ? "bg-slate-900" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 rounded-full bg-white transition ${
                        settings[key] ? "translate-x-4.5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700">
                <MapPinned className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-500">Map</p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-900">Preferences</h2>
              </div>
            </div>

            <div className="mt-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <span className="text-xs font-medium text-slate-700">Show Risk Layer by Default</span>
                <button
                  type="button"
                  onClick={() => updateSetting("showRiskLayerByDefault", !settings.showRiskLayerByDefault)}
                  aria-label="Toggle default risk layer"
                  className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition ${
                    settings.showRiskLayerByDefault ? "bg-slate-900" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 rounded-full bg-white transition ${
                      settings.showRiskLayerByDefault ? "translate-x-4.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <label htmlFor="default-map-view" className="mb-1 block text-xs font-medium text-slate-700">
                  Default Map View
                </label>
                <select
                  id="default-map-view"
                  value={settings.defaultMapView || "State"}
                  onChange={(event) => updateSetting("defaultMapView", event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none ring-0 transition focus:border-slate-400"
                >
                  <option value="State">State</option>
                  <option value="District">District</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700">
                <Settings2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-500">Application</p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-900">Configuration</h2>
              </div>
            </div>

            <div className="mt-2.5 grid gap-2 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Language</span>
                </div>
                <span className="text-xs font-medium text-slate-900">{settings.language || "English"}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Layers3 className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">BhuSetu Version</span>
                </div>
                <span className="text-xs font-medium text-slate-900">{settings.appVersion || "v1.0"}</span>
              </div>
            </div>
          </section>

          {/* <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700">
                <LogOut className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-500">Account</p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-900">Logout</h2>
              </div>
            </div>

            <button
              type="button"
              className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </section> */}
        </div>
      </main>
    </div>
  );
}
