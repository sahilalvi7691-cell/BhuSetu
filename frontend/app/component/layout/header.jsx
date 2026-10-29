"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLayout } from "./layoutContext";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoMdSettings } from "react-icons/io";
import { VscSignOut } from "react-icons/vsc";
import { CgProfile } from "react-icons/cg";
import Image from "next/image";
import "./header.css";
import HeaderConfig from "../../config/header.config";
import ProfilePopup from "@/components/ProfilePopup";
import SettingsPopup from "@/components/SettingsPopup";

const Header = ({ title }) => {
  const pathname = usePathname();
  const { isCollapsed, setShowNavbar } = useLayout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false);

  const currentRole = pathname?.startsWith("/roles/project-officer")
    ? "project-officer"
    : pathname?.startsWith("/roles/LandAcqOfficer")
      ? "LandAcqOfficer"
        : pathname?.startsWith("/roles/super-admin")
          ? "super-admin"
          : pathname?.startsWith("/roles/admin")
            ? "admin"
            : "nodal-officer";

  const currentUser = HeaderConfig.roles[currentRole] ?? HeaderConfig.roles["nodal-officer"];
  const isSuperAdmin = currentRole === "super-admin";

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => {
      const next = !prev;
      setIsPinned(next ? true : false);
      return next;
    });
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setIsPinned(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <header className="h-15 z-1000">
      <div
        className={`fixed top-0 right-0 z-2000 bg-[#fdfdff] shadow-sm
        flex justify-between items-center md:px-2 md:pr-5 md:py-4 h-16
        transition-all duration-300 left-0
        ${isCollapsed ? "md:left-20" : "left-0 md:left-64"}`}
      >
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowNavbar(true)}
            className="
              flex items-center justify-center
              text-slate-400 text-2xl
              bg-slate-100 px-3 py-3 rounded-xl
              transition-all duration-300
              hover:bg-slate-200
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-slate-300 md:hidden
            "
          >
            <GiHamburgerMenu />
          </button>
          <div className="inline-flex items-center justify-center">
            <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-linear-to-r from-slate-100 to-slate-200 text-slate-800 font-semibold text-sm shadow-inner ring-1 ring-slate-900/5">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isSuperAdmin && <div ref={dropdownRef} className="relative">
            <div
              onMouseEnter={() => setIsDropdownOpen(true)}
              onClick={toggleDropdown}
              className="rounded-full flex items-center justify-end bg-slate-100 px-2 py-1 gap-1 cursor-pointer hover:bg-slate-200 transition-all duration-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 active:scale-95"
            >
              <div className="flex flex-row gap-2 justify-center items-center">
                <Image
                  src={currentUser.profileImg}
                  width={45}
                  height={45}
                  alt={`${currentUser.officerName} profile`}
                  className="rounded-full"
                />
                <p className="flex flex-col text-xs text-slate-600 overflow-hidden whitespace-nowrap text-ellipsis">
                  <span className="font-bold text-sm">{currentUser.officerName}</span>
                  <span>{currentUser.role}</span>
                </p>
              </div>
              <RiArrowDropDownLine className={`text-2xl text-slate-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {isDropdownOpen && (
              <div
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => {
                  if (!isPinned) setIsDropdownOpen(false);
                }}
                className="absolute right-0 mt-2 w-45 bg-white rounded-md shadow-lg z-50 transform origin-top-right animate-dropdown will-change-transform p-2 flex flex-col gap-2"
              >
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsProfilePopupOpen(true);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <CgProfile /> My Profile
                  </span>
                </button>
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsSettingsPopupOpen(true);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <IoMdSettings /> Settings
                  </span>
                </button>
                <button
                  className="menu-item logout-button"
                  onClick={() => {
                    console.log("Logout clicked");
                  }}
                >
                  <span className="flex items-center gap-2"><VscSignOut /> Logout</span>
                </button>
              </div>
            )}
          </div>}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 border border-slate-200/80 shadow-sm text-sm cursor-pointer hover:bg-slate-100 transition-all duration-300">
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-bold text-slate-800">{currentUser.district},</span>
            <span className="font-medium text-slate-500">{currentUser.state}</span>
          </div>
        </div>
      </div>

      {!isSuperAdmin && <ProfilePopup
        role={currentRole}
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
      />}

      <SettingsPopup
        role={currentRole}
        isOpen={isSettingsPopupOpen}
        onClose={() => setIsSettingsPopupOpen(false)}
      />
    </header>
  );
};

export default Header;