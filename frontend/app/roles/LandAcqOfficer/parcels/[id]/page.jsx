"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Map,
  Plus,
} from "lucide-react";

export default function ParcelVerification({ params }) {
  const { id } = React.use(params);
  const storageKey = `BhuSetu-parcels:${id}`;
  const [parcels, setParcels] = useState([]);
  const [form, setForm] = useState({
    parcelId: "",
    surveyNumber: "",
    village: "",
    tehsil: "",
    district: "",
    state: "",
    totalArea: "",
    acquisitionArea: "",
    landUseType: "",
  });

  useEffect(() => {
    const savedParcels = window.localStorage.getItem(storageKey);
    if (savedParcels) setParcels(JSON.parse(savedParcels));
  }, [storageKey]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addParcel = (event) => {
    event.preventDefault();
    const updatedParcels = [...parcels, { ...form, status: "Pending Verification" }];
    setParcels(updatedParcels);
    window.localStorage.setItem(storageKey, JSON.stringify(updatedParcels));
    setForm({
      parcelId: "", surveyNumber: "", village: "", tehsil: "", district: "",
      state: "", totalArea: "", acquisitionArea: "", landUseType: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          href={`/roles/LandAcqOfficer/my-project/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
              <Map className="h-7 w-7 text-blue-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                PARCEL VERIFICATION
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Project #{id}
              </h1>

              <p className="text-sm text-slate-500">
                Add parcel information and verify each parcel for this project
              </p>
            </div>

          </div>
        </div>

        {/* Verification Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Parcel Verification
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add the land details shown in the parcel records and verify them individually.
            </p>
          </div>

          <div className="space-y-6 p-6">
            <form onSubmit={addParcel} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ["parcelId", "Parcel ID"], ["surveyNumber", "Khasra / Survey Number"],
                  ["village", "Village"], ["tehsil", "Tehsil"], ["district", "District"],
                  ["state", "State"], ["totalArea", "Total Parcel Area"],
                  ["acquisitionArea", "Required Acquisition Area"], ["landUseType", "Land Use Type"],
                ].map(([field, label]) => (
                  <label key={field} className="text-sm font-medium text-slate-700">
                    {label}
                    <input
                      required
                      type={field.includes("Area") ? "number" : "text"}
                      step={field.includes("Area") ? "0.01" : undefined}
                      value={form[field]}
                      onChange={(event) => updateForm(field, event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ))}
              </div>
              <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                <Plus className="h-5 w-5" />
                Add Parcel
              </button>
            </form>

            {parcels.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No parcels added yet.</p>
            ) : parcels.map((parcel, index) => (
              <div key={`${parcel.parcelId}-${index}`} className="rounded-xl border border-slate-200 p-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Parcel ID", parcel.parcelId], ["Khasra / Survey Number", parcel.surveyNumber],
                    ["Village", parcel.village], ["Tehsil", parcel.tehsil], ["District", parcel.district],
                    ["State", parcel.state], ["Total Parcel Area", parcel.totalArea],
                    ["Required Acquisition Area", parcel.acquisitionArea], ["Land Use Type", parcel.landUseType],
                  ].map(([label, value]) => (
                    <div key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>
                  ))}
                  <div>
                    <p className="text-sm text-slate-500">Parcel Verification Status</p>
                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${parcel.status === "Submitted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{parcel.status}</span>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <Link
                    href={`/roles/LandAcqOfficer/acquisition-cases?parcelId=${encodeURIComponent(parcel.parcelId)}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                  >
                    Verify Parcel
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}