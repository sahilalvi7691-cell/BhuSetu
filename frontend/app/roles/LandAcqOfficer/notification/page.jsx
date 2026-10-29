"use client";

import React, { useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  FolderPlus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  AlertTriangle,
  Undo2,
  X,
} from "lucide-react";
import { Header } from "@/app/component/layout"

const notificationsData = [
  {
    id: 1,
    type: "assigned",
    title: "Project assigned",
    message:
      "You have been assigned a new project for land acquisition and parcel verification.",
    project: "Delhi-Mumbai Expressway",
    projectId: "BH-2026-001",
    sender: "Nodal Officer Amit Sharma",
    date: "10 Sept 2026, 09:30 am",
    unread: true,
    tag: "NEW",
  },

  {
    id: 2,
    type: "reverification",
    title: "Re-verification requested",
    message:
      "Nodal Officer has requested re-verification of 7 parcels due to discrepancies in land ownership records.",
    project: "Rohini Sector 18 Drainage Expansion",
    projectId: "BhuSetu-2026-142",
    sender: "Amit Sharma · Nodal Officer",
    date: "10 Sept 2026, 10:15 am",
    unread: true,
    tag: "ACTION REQUIRED",
  },

  {
    id: 3,
    type: "returned",
    title: "Project returned for correction",
    message:
      "The project has been returned by the Nodal Officer. Please review the remarks and update the required parcel information.",
    project: "Yamuna Flood Control",
    projectId: "BH-2026-015",
    sender: "Nodal Officer Amit Sharma",
    date: "09 Sept 2026, 04:20 pm",
    unread: true,
    tag: "ACTION REQUIRED",
  },

  {
    id: 4,
    type: "documents",
    title: "Documents updated",
    message:
      "Additional land records and ownership documents have been uploaded and are ready for verification.",
    project: "Industrial Corridor",
    projectId: "BH-2026-021",
    sender: "Project Officer Mohd Saqib",
    date: "09 Sept 2026, 02:45 pm",
    unread: true,
    tag: "NEW",
  },

  {
    id: 5,
    type: "discrepancy",
    title: "Parcel discrepancy detected",
    message:
      "Ownership information for 4 parcels does not match the submitted land records. Review is required.",
    project: "Delhi-Mumbai Expressway",
    projectId: "BH-2026-001",
    sender: "System",
    date: "09 Sept 2026, 11:30 am",
    unread: true,
    tag: "ACTION REQUIRED",
  },

  {
    id: 6,
    type: "deadline",
    title: "Verification deadline approaching",
    message:
      "Parcel verification is due in 3 days. Please complete the pending 14 parcels.",
    project: "Delhi-Mumbai Expressway",
    projectId: "BH-2026-001",
    sender: "System",
    date: "08 Sept 2026, 09:00 am",
    unread: false,
    tag: "REMINDER",
  },

  {
    id: 7,
    type: "assigned",
    title: "Project assigned",
    message:
      "A new project has been assigned to you for initial parcel verification.",
    project: "Rohini Metro Extension",
    projectId: "BH-2026-008",
    sender: "Nodal Officer Amit Sharma",
    date: "07 Sept 2026, 01:20 pm",
    unread: false,
    tag: "NEW",
  },

  {
    id: 8,
    type: "completed",
    title: "Verification completed",
    message:
      "Your parcel verification has been submitted successfully and is now under Nodal Officer review.",
    project: "Yamuna Flood Control",
    projectId: "BH-2026-015",
    sender: "System",
    date: "06 Sept 2026, 05:10 pm",
    unread: false,
    tag: "COMPLETED",
  },

  {
    id: 9,
    type: "approved",
    title: "Project verification approved",
    message:
      "The Nodal Officer has approved your parcel verification for this project.",
    project: "Industrial Corridor",
    projectId: "BH-2026-021",
    sender: "Amit Sharma · Nodal Officer",
    date: "05 Sept 2026, 03:30 pm",
    unread: false,
    tag: "APPROVED",
  },
];

function getNotificationIcon(type) {
  switch (type) {
    case "assigned":
      return <FolderPlus size={21} />;

    case "reverification":
      return <RefreshCw size={21} />;

    case "returned":
      return <Undo2 size={21} />;

    case "documents":
      return <FileText size={21} />;

    case "discrepancy":
      return <AlertTriangle size={21} />;

    case "deadline":
      return <Clock3 size={21} />;

    case "completed":
      return <CheckCircle2 size={21} />;

    case "approved":
      return <CheckCircle2 size={21} />;

    default:
      return <Bell size={21} />;
  }
}

function getTagClass(type) {
  switch (type) {
    case "reverification":
    case "returned":
    case "discrepancy":
      return "bg-red-50 text-red-600 border border-red-200";

    case "deadline":
      return "bg-orange-50 text-orange-600 border border-orange-200";

    case "completed":
    case "approved":
      return "bg-green-50 text-green-600 border border-green-200";

    default:
      return "bg-blue-50 text-blue-600 border border-blue-200";
  }
}

function getIconClass(type) {
  switch (type) {
    case "reverification":
    case "returned":
    case "discrepancy":
      return "text-red-600";

    case "deadline":
      return "text-orange-600";

    case "completed":
    case "approved":
      return "text-green-600";

    default:
      return "text-blue-600";
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        notification.title.toLowerCase().includes(searchText) ||
        notification.message.toLowerCase().includes(searchText) ||
        notification.project.toLowerCase().includes(searchText) ||
        notification.projectId.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && notification.unread) ||
        (filter === "action" &&
          ["reverification", "returned", "discrepancy"].includes(
            notification.type
          ));

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#09264f]">
      <Header title="NotificationsPage"/>

      {/* ================= MAIN ================= */}
      <main className="max-w-[1490px] mx-auto px-10 py-6">

        {/* ================= ACTIVITY CENTER ================= */}
        <section className="bg-white rounded-[20px] border border-slate-200 shadow-sm px-5 py-4">

          {/* Heading */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <p className="text-sm tracking-[2px] font-medium text-[#52709c] uppercase">
                Activity Center
              </p>

              <h1 className="text-[23px] font-bold text-[#071f45] mt-1">
                Project notifications
              </h1>

              <p className="text-sm text-[#31547f] mt-1">
                Stay updated on assignments, verification requests, project
                changes, and actions requiring your attention.
              </p>
            </div>

            <div className="flex items-center gap-3">

              {/* Unread */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-700">
                <Bell size={15} />
                <span>{unreadCount} unread</span>
              </div>

              {/* Mark all */}
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm hover:bg-slate-50 transition"
              >
                <Check size={15} />
                Mark All as Read
              </button>
            </div>
          </div>

          {/* ================= SEARCH + FILTER ================= */}
          <div className="flex items-center justify-between gap-5 pt-4">

            {/* Search */}
            <div className="relative w-[560px]">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search notifications"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[42px] pl-11 pr-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">

              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                  filter === "all"
                    ? "bg-[#0c1730] text-white border-[#0c1730]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                ALL
              </button>

              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                  filter === "unread"
                    ? "bg-[#0c1730] text-white border-[#0c1730]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                UNREAD
              </button>

              <button
                onClick={() => setFilter("action")}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                  filter === "action"
                    ? "bg-[#0c1730] text-white border-[#0c1730]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                ACTION REQUIRED
              </button>

              <button
                onClick={clearNotifications}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm hover:bg-red-50 hover:text-red-600 transition"
              >
                <X size={15} />
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* ================= NOTIFICATION LIST ================= */}
        <section className="mt-4 space-y-2">

          {filteredNotifications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
              <Bell
                size={40}
                className="mx-auto text-slate-300 mb-3"
              />

              <h3 className="font-semibold text-lg text-slate-700">
                No notifications found
              </h3>

              <p className="text-slate-400 mt-1">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative bg-white border rounded-xl px-4 py-3 shadow-sm transition hover:shadow-md ${
                  notification.unread
                    ? "border-slate-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 flex-shrink-0 rounded-lg border border-slate-200 bg-white shadow-sm flex items-center justify-center ${getIconClass(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">

                    {/* Title */}
                    <div className="flex items-center gap-2 flex-wrap">

                      <h2 className="font-bold text-[17px] text-[#071f45]">
                        {notification.title}
                      </h2>

                      {notification.unread && (
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getTagClass(
                            notification.type
                          )}`}
                        >
                          {notification.tag}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-[#31547f] mt-1 leading-5">
                      {notification.message}
                    </p>

                    {/* Project */}
                    <div className="mt-2">
                      <p className="font-medium text-[#12365f]">
                        {notification.project}
                      </p>

                      <p className="text-sm text-[#52709c] mt-0.5">
                        {notification.projectId}
                      </p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="w-[270px] flex-shrink-0 text-right">

                    <p className="text-sm text-[#12365f]">
                      {notification.sender}
                    </p>

                    <p className="text-sm text-[#52709c] mt-1">
                      {notification.date}
                    </p>

                    {/* Buttons */}
                    <div className="flex justify-end gap-1.5 mt-3">

                      <button
                        className="px-3 py-1.5 rounded-lg bg-[#0c1730] text-white text-xs font-semibold hover:bg-[#172545] transition"
                        onClick={() =>
                          console.log(
                            "Open project:",
                            notification.projectId
                          )
                        }
                      >
                        View →
                      </button>

                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs hover:bg-slate-50 transition"
                      >
                        <Check size={15} />

                        {notification.unread ? "Mark" : "Read"}
                      </button>

                      <button
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition text-xs"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* ================= FOOTER COUNT ================= */}
        <div className="text-sm text-slate-500 mt-5 pb-8">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredNotifications.length}
          </span>{" "}
          notifications
        </div>
      </main>
    </div>
  );
}