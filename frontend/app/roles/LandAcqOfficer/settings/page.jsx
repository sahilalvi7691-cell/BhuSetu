"use client";

import { useState } from "react";
import {
  Bell,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Shield,
  User,
} from "lucide-react";

import { Header } from "@/app/component/layout/index";

export default function Page() {
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const officerProfile = {
    name: "Umar Khalid",
    email: "Umar.Khalid@bhusetu.in",
    phone: "+91 98765 43210",
    role: "Land Acquisition Officer",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header title="Settings" />

      <main className="mx-auto max-w-8xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Profile</p>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Officer details</h1>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <User className="h-4 w-4 text-slate-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Name</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{officerProfile.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Email</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{officerProfile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Phone className="h-4 w-4 text-slate-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Phone</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{officerProfile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Shield className="h-4 w-4 text-slate-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Role</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{officerProfile.role}</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Notifications</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">Preferences</h2>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">In-app notifications</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInAppNotifications((value) => !value)}
                    aria-label="Toggle in-app notifications"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      inAppNotifications ? "bg-slate-900" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition ${
                        inAppNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Email notifications</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifications((value) => !value)}
                    aria-label="Toggle email notifications"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      emailNotifications ? "bg-slate-900" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition ${
                        emailNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Account</p>
              <button
                type="button"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}