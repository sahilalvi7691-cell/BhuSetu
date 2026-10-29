"use client";

import { AlertCircle, Camera, Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PROFILE_ROLE_MAP = {
  "project-officer": "project_officer",
  "project_officer": "project_officer",
  "landacqofficer": "land_acquisition_officer",
  "land-acqofficer": "land_acquisition_officer",
  "landacquisitionofficer": "land_acquisition_officer",
  "land-acquisition-officer": "land_acquisition_officer",
  "land_acquisition_officer": "land_acquisition_officer",
  "nodal-officer": "nodal_officer",
  "nodal_officer": "nodal_officer",
  "admin": "admin",
  "system_admin": "system_admin",
  "admin": "system_admin",
};

const normalizeRoleKey = (role) => {
  const value = String(role ?? "").trim().toLowerCase();

  if (!value) return "project_officer";

  if (PROFILE_ROLE_MAP[value]) return PROFILE_ROLE_MAP[value];

  if (value.includes("project")) return "project_officer";
  if (value.includes("land") || value.includes("acquisition")) return "land_acquisition_officer";
  if (value.includes("nodal")) return "nodal_officer";
  if (value.includes("admin") || value.includes("system")) return "system_admin";

  return "project_officer";
};

export default function ProfilePopup({ role, isOpen, onClose }) {
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showUsername, setShowUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      setSelectedImage("");
      setIsEditingImage(false);
      setImageError("");
      setShowUsername(false);
      setShowPassword(false);

      try {
        const response = await fetch("/data/profiles.json");
        if (!response.ok) {
          throw new Error(`Failed to load profile data (${response.status})`);
        }

        const data = await response.json();
        const roleKey = normalizeRoleKey(role);
        const resolvedProfile = data[roleKey] || data.default || Object.values(data)[0] || null;

        setProfile(resolvedProfile);
      } catch (loadError) {
        setError(loadError.message || "Unable to load profile information.");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, role]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen, onClose]);

  const handleImageSelection = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isValidSize = file.size <= 2 * 1024 * 1024;

    if (!isImage) {
      setImageError("Please upload a valid image file.");
      return;
    }

    if (!isValidSize) {
      setImageError("Image size should be less than 2 MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);
    setImageError("");
    setIsEditingImage(true);
  };

  const handleImageReset = () => {
    setSelectedImage("");
    setIsEditingImage(false);
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSave = () => {
    if (!profile) return;

    setProfile((currentProfile) => ({
      ...currentProfile,
      profileImage: selectedImage || currentProfile.profileImage,
    }));

    setIsEditingImage(false);
    setSelectedImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  const activeImage = selectedImage || profile?.profileImage || "/images/logo.png";
  const maskedUsername = profile?.username ? profile.username.slice(0, 2) + "••••••" : "";
  const maskedPassword = profile?.password ? "••••••••" : "";

  return (
    <>
      <style jsx>{`
        @keyframes profilePopupIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes profileTabIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-popup-shell {
          animation: profilePopupIn 0.22s ease-out;
        }

        .profile-tab-panel {
          animation: profileTabIn 0.18s ease-out;
        }
      `}</style>

      <div className="fixed inset-0 z-2000 flex items-center justify-center bg-slate-900/25 px-4 py-6 backdrop-blur-[1px] transition-opacity duration-200 ease-out">
        <div
          ref={modalRef}
          className="profile-popup-shell relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 ease-out"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-popup-title"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                User profile
              </p>
              <h2 id="profile-popup-title" className="mt-1 text-xl font-semibold text-slate-900">
                Profile Details
              </h2>
            </div>

            <button
              type="button"
              aria-label="Close profile popup"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-200 ease-out hover:scale-105 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading && (
            <div className="flex min-h-65 items-center justify-center gap-3 p-6 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading profile information...</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex min-h-65 items-center justify-center p-6">
              <div className="flex max-w-md items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <div className="font-semibold">Unable to load profile</div>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && profile && (
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <img
                  src={activeImage}
                  alt={`${profile.name || "Profile"} avatar`}
                  className="h-24 w-24 rounded-full border border-slate-200 object-cover shadow-sm"
                />

                <button
                  type="button"
                  aria-label="Edit profile image"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  <Camera className="h-4 w-4" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelection}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-semibold text-slate-900">{profile.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{profile.role}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>

            {isEditingImage && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Image selected for preview</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleImageReset}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImageSave}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Save Image
                  </button>
                </div>
              </div>
            )}

            {imageError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {imageError}
              </div>
            )}

            <div className="mt-5">
              <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 transition-all duration-200 ease-out">
                <button
                  type="button"
                  onClick={() => setActiveTab("personal")}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ease-out ${
                    activeTab === "personal"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Personal Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("account")}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ease-out ${
                    activeTab === "account"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Account Details
                </button>
              </div>

              {activeTab === "personal" ? (
                <div key="personal" className="profile-tab-panel space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Full Name
                      </span>
                      <input
                        value={profile.name || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Role / Designation
                      </span>
                      <input
                        value={profile.role || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Employee ID
                      </span>
                      <input
                        value={profile.employeeId || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Email
                      </span>
                      <input
                        value={profile.email || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Mobile Number
                      </span>
                      <input
                        value={profile.phone || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Department / Organization
                      </span>
                      <input
                        value={profile.department || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        State
                      </span>
                      <input
                        value={profile.state || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Jurisdiction
                      </span>
                      <input
                        value={profile.jurisdiction || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div key="account" className="profile-tab-panel space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Username
                      </span>
                      <div className="relative">
                        <input
                          type={showUsername ? "text" : "password"}
                          value={showUsername ? profile.username || "" : maskedUsername || ""}
                          disabled
                          readOnly
                          aria-label="Username"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-slate-700 outline-none"
                        />
                        <button
                          type="button"
                          aria-label={showUsername ? "Hide username" : "Show username"}
                          onClick={() => setShowUsername((current) => !current)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                        >
                          {showUsername ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Password
                      </span>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={showPassword ? profile.password || "" : maskedPassword || ""}
                          disabled
                          readOnly
                          aria-label="Password"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-slate-700 outline-none"
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Account Status
                      </span>
                      <input
                        value={profile.status || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Assigned Projects
                      </span>
                      <input
                        value={profile.assignedProjects || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Last Login
                      </span>
                      <input
                        value={profile.lastLogin || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-700">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        Account Created
                      </span>
                      <input
                        value={profile.accountCreated || ""}
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
