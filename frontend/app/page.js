"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { animate } from "animejs";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gauge,
  Landmark,
  Layers3,
  MapPinned,
  Menu,
  MoonStar,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Target,
  TrendingUp,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "./page.css";

const navItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Contact Us", id: "contact" },
];

const objectiveCards = [
  {
    icon: Target,
    title: "Early Risk Detection",
    text: "Identify projects that may face acquisition delays before they become critical.",
  },
  {
    icon: Sparkles,
    title: "Explainable AI",
    text: "Understand why a project is at risk and which factors contribute most to the prediction.",
  },
  {
    icon: ArrowUpRight,
    title: "Actionable Intervention",
    text: "Provide recommendations that help responsible officers address identified issues.",
  },
];


const roleCards = [
  {
    icon: BriefcaseBusiness,
    title: "Project Officer",
    responsibilities: [
      "Create infrastructure projects and define scope.",
      "Enter project location, land area, and route details.",
      "Submit GIS boundaries and track project progress.",
      "View AI-generated risk summaries for assigned projects.",
    ],
    authority:
      "Creates and tracks projects; does not manage legal acquisition decisions.",
  },
  {
    icon: Landmark,
    title: "Land Acquisition Officer (LAO)",
    responsibilities: [
      "Verify candidate land parcels and ownership records.",
      "Maintain acquisition, compensation, legal, and R&R updates.",
      "Manage acquisition documents, approvals, and possession status.",
      "Submit verified acquisition data for AI assessment.",
    ],
    authority:
      "Manages assigned acquisition records and submits official acquisition updates.",
  },
  {
    icon: UserRoundCog,
    title: "Nodal Officer",
    responsibilities: [
      "Monitor project risk assessments and risk trends.",
      "Review risk factors, GIS views, and AI recommendations.",
      "Record interventions and follow-up progress.",
      "Track risk changes after acquisition data is updated.",
    ],
    authority:
      "Coordinates risk monitoring and interventions; does not manually override AI-generated scores.",
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    responsibilities: [
      "Create, update, activate, and deactivate officer accounts.",
      "Manage officer profiles, roles, and access permissions.",
      "Configure jurisdictions, districts, and project assignments.",
      "Monitor administrative activity and authorized audit records.",
    ],
    authority:
      "Manages day-to-day platform administration within assigned permissions; does not make land acquisition decisions.",
  },
  {
    icon: ShieldCheck,
    title: "Super Admin",
    responsibilities: [
      "Oversee platform-wide administration and security settings.",
      "Create and manage Admin accounts and their permissions.",
      "Configure global role policies and system-level settings.",
      "Review platform-wide audit logs and security events.",
      "Monitor system health and AI model metadata.",
    ],
    authority:
      "Has authorized platform-wide administrative privileges; does not resolve legal disputes, make acquisition decisions, or manually alter AI-generated risk scores.",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Project Creation",
    label: "Input",
    text: "The project officer creates the infrastructure project and defines its route or boundary.",
    accent: "emerald",
    icon: BriefcaseBusiness,
  },
  {
    number: "02",
    title: "GIS Parcel Identification",
    label: "Spatial Match",
    text: "Authorized GIS data is intersected with the project polygon or route buffer to identify candidate parcels.",
    accent: "teal",
    icon: MapPinned,
  },
  {
    number: "03",
    title: "Acquisition Data Verification",
    label: "Field Data",
    text: "The LAO validates ownership, compensation, legal, and R&R status for the verified acquisition case.",
    accent: "amber",
    icon: Landmark,
  },
  {
    number: "04",
    title: "AI Risk Prediction",
    label: "Assessment",
    text: "The model calculates delay probability, highlights risk factors, and recommends corrective action.",
    accent: "violet",
    icon: Gauge,
  },
  {
    number: "05",
    title: "Officer Intervention",
    label: "Action",
    text: "The nodal officer reviews the risk assessment, records interventions, and coordinates follow-up.",
    accent: "blue",
    icon: UserRoundCog,
  },
  {
    number: "06",
    title: "Dynamic Risk Recalculation",
    label: "Monitoring",
    text: "When verified acquisition information changes, the system refreshes the risk history and score.",
    accent: "rose",
    icon: TrendingUp,
  },
];

const featureCards = [
  {
    icon: Gauge,
    title: "AI-Powered Delay Prediction",
    text: "Estimate the likelihood of acquisition delays and classify risk as Low, Medium, High, or Critical.",
  },
  {
    icon: Activity,
    title: "Explainable Risk Factors",
    text: "Display the leading contributors to predicted delay, such as compensation issues, legal disputes, or ownership verification.",
  },
  {
    icon: MapPinned,
    title: "GIS-Based Risk Visualization",
    text: "Visualize project locations, routes, available parcel geometry, and risk information on an interactive map.",
  },
  {
    icon: CheckCircle2,
    title: "Actionable Recommendations",
    text: "Link suggested actions directly to the identified risk factors and responsible officer workflows.",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Risk Monitoring",
    text: "Reassess predicted risk after verified data updates and maintain a history of changes over time.",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    text: "Ensure users access only the projects and operations permitted by their assignments.",
  },
  {
    icon: Layers3,
    title: "Risk Analytics",
    text: "Show risk distribution, major delay drivers, project comparisons, and trends where sufficient data exists.",
  },
  {
    icon: FileText,
    title: "Transparent Assessments",
    text: "Display assessment timestamps, model version, and confidence information when available.",
  },
];

const roleLinks = [
  { href: "/roles/project-officer/", name: "Project Officer", text: "Create projects and submit GIS boundaries.", index: "01" },
  { href: "/roles/LandAcqOfficer/", name: "Land Acquisition Officer", text: "Review parcels and acquisition progress.", index: "02" },
  { href: "/roles/nodal-officer/", name: "Nodal Officer", text: "Monitor risk, actions and project closure.", index: "03" },
  { href: "/roles/admin", name: "Admin", text: "Manage users, jurisdictions and controls.", index: "04" },
  { href: "/roles/super-admin", name: "Super Admin", text: "Verify projects and make final decisions.", index: "05" },
];

const workspaceShowcase = [
  { href: "/roles/project-officer/", name: "Project Officer", image: "project-officer.png", alt: "Project Officer dashboard showing project portfolio and GIS overview" },
  { href: "/roles/LandAcqOfficer/", name: "Land Acquisition Officer", image: "land-acquisition.png", alt: "Land Acquisition Officer dashboard showing parcel verification and project progress" },
  { href: "/roles/nodal-officer/", name: "Nodal Officer", image: "nodal-officer.png", alt: "Nodal Officer dashboard showing a risk watchlist and spatial risk map" },
  { href: "/roles/admin", name: "Administrator", image: "admin.png", alt: "Administrator dashboard showing user and project overview" },
  { href: "/roles/super-admin", name: "Super Admin", image: "super-admin.png", alt: "Super Admin dashboard showing system-wide project status and risk distribution" },
];

export default function Page() {  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const savedTheme = window.localStorage.getItem("bhusetu-theme");
    return savedTheme || "light";
  });
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(0);
  const [workspaceSliderPaused, setWorkspaceSliderPaused] = useState(false);
  const roleDialogRef = useRef(null);

  useEffect(() => {
    const dialog = roleDialogRef.current;
    if (rolePickerOpen && dialog && !dialog.open) dialog.showModal();
  }, [rolePickerOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("bhusetu-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (workspaceSliderPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveWorkspace((current) => (current + 1) % workspaceShowcase.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [workspaceSliderPaused]);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { rootMargin: "-35% 0px -40% 0px", threshold: [0.2, 0.4, 0.7] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal-card");
    if (!revealElements.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            target.classList.add("is-visible");
            animate(target, {
              opacity: [0, 1],
              translateY: [28, 0],
              scale: [0.985, 1],
              delay: Number(target.dataset.revealDelay || 0),
              duration: 700,
              easing: "easeOutCubic",
            });
            revealObserver.unobserve(target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
    return () => revealObserver.disconnect();
  }, []);

  return (
    <main className="landing-page" data-theme={theme}>
      <header className="site-header">
        <div className="container nav-shell">
          <a href="#home" className="brand" aria-label="BhuSetu home" >
            <Image
              src="/images/logo.png"
              alt="BhuSetu"
              width={690}
              height={348}
              className="brand-logo"
              priority
            />
          </a>

          <nav className="main-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link ${activeSection === item.id ? "active" : ""}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <MoonStar size={18} /> : <SunMedium size={18} />}
            </button>

            <button
              type="button"
              className="menu-toggle"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`mobile-link ${activeSection === item.id ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <dialog
        ref={roleDialogRef}
        className="role-picker-dialog"
        aria-labelledby="role-picker-title"
        onClose={() => setRolePickerOpen(false)}
        onClick={(event) => {
          if (event.target === roleDialogRef.current) roleDialogRef.current.close();
        }}
      >
        <div className="role-picker-content">
          <div className="role-picker-header">
            <div>
              <span className="section-tag">Platform Access</span>
              <h2 id="role-picker-title">Choose your role</h2>
              <p>Select a workspace to continue.</p>
            </div>
            <button
              type="button"
              className="role-picker-close"
              aria-label="Close role selection"
              onClick={() => roleDialogRef.current?.close()}
            >
              <X size={20} />
            </button>
          </div>
          <div className="role-picker-grid">
            {roleLinks.map(({ href, name, text, index }) => (
              <Link
                key={name}
                href={href}
                className="role-picker-card"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => roleDialogRef.current?.close()}
              >
                <span className="role-picker-index">{index}</span>
                <span className="role-picker-copy">
                  <strong>{name}</strong>
                  <span>{text}</span>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </dialog>

      <section id="home" className="hero-section" >
        <div className="hero-overlay" aria-hidden="true" />
        <div className="sub-hero-section">
        <div className="container hero-layout">
          <div className="hero-copy">
            <h1>
              The operating system for <span>smarter land acquisition</span>.
            </h1>
            <p>
              Bring project data, parcel intelligence, acquisition progress, and explainable risk
              insights together in one workspace for public infrastructure teams.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => setRolePickerOpen(true)}
              >
                Explore Platform
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <a href="#workflow" className="secondary-button">
                See how it works
              </a>
            </div>
          </div>
        </div>
        <div
          className="container project-slider"
          role="region"
          aria-roledescription="carousel"
          aria-label="BhuSetu workspaces"
          onMouseEnter={() => setWorkspaceSliderPaused(true)}
          onMouseLeave={() => setWorkspaceSliderPaused(false)}
          onFocus={() => setWorkspaceSliderPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setWorkspaceSliderPaused(false);
          }}
        >
          <div className="project-slider-stage">
            <div
              className="project-slider-track"
              style={{ transform: `translateX(-${activeWorkspace * (100 / workspaceShowcase.length)}%)` }}
            >
              {workspaceShowcase.map(({ href, name, image, alt }, index) => (
                <Link
                  key={name}
                  href={href}
                  className={`project-slide ${index === activeWorkspace ? "is-active" : ""}`}
                  aria-label={`Open ${name} workspace`}
                  aria-hidden={index !== activeWorkspace}
                  tabIndex={index === activeWorkspace ? 0 : -1}
                >
                  <Image
                    src={`/images/project-images/${image}`}
                    alt={alt}
                    width={1890}
                    height={910}
                    sizes="(max-width: 720px) 100vw, 1180px"
                    priority={index === 0}
                  />
                  <span className="project-slide-caption">
                    <span className="project-slide-index">0{index + 1} / 0{workspaceShowcase.length}</span>
                    <strong>{name} Workspace</strong>
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="project-slider-controls">
            <button
                type="button"
                aria-label="Show previous workspace"
                onClick={() => setActiveWorkspace((current) => (current - 1 + workspaceShowcase.length) % workspaceShowcase.length)}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
            <div className="project-slider-dots" aria-label="Choose a workspace image">
              {workspaceShowcase.map(({ name }, index) => (
                <button
                  key={name}
                  type="button"
                  className={`project-slider-dot ${index === activeWorkspace ? "is-active" : ""}`}
                  aria-label={`Show ${name} image`}
                  aria-current={index === activeWorkspace ? "true" : undefined}
                  onClick={() => setActiveWorkspace(index)}
                />
              ))}
            </div>
              
              <button
                type="button"
                aria-label="Show next workspace"
                onClick={() => setActiveWorkspace((current) => (current + 1) % workspaceShowcase.length)}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
          </div>
        </div>
        </div>
      </section>

      <section id="about" className="objective-section">
        <div className="container section-intro">
          <span className="section-tag">Project Objective</span>
          <h2>Making Land Acquisition More Predictable</h2>
        </div>

        <div className="container i+ntro-grid">
          <div className="intro-copy">
            <p>
              Land acquisition delays can arise from unresolved legal disputes, compensation issues,
              ownership verification, rehabilitation and resettlement requirements, and pending
              approvals.
            </p>
            <p>
              BhuSetu uses available project, acquisition, and authorized GIS data to identify
              potential delay risks, explain the contributing factors, and support timely
              intervention by government officers.
            </p>
          </div>

          <div className="objective-cards">
            {objectiveCards.map(({ icon: Icon, title, text }) => (
              <article key={title} className="info-card reveal-card">
                <div className="icon-wrap">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="roles-section">
        <div className="container section-intro compact">
          <span className="section-tag">Workflow</span>
          <h2>A Connected Workflow. Clear Accountability.</h2>
        </div>

        <div className="container role-grid">
          {roleCards.map(({ icon: Icon, title, responsibilities, authority }) => (
            <article key={title} className="role-card reveal-card">
              <div className="role-topline">
                <span className="role-icon">
                  <Icon size={20} />
                </span>
                <span className="role-role">Officer</span>
              </div>
              <h3>{title}</h3>

              <ul>
                {responsibilities.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="authority-block">
                <span>Authority</span>
                <p>{authority}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="role-portal-section">
        <div className="container role-portal-header">
          <div>
            <span className="section-tag">Main Access</span>
            <h2>Explore the system by role</h2>
          </div>
          <p>Jump directly into the dashboard or workflow assigned to each officer profile.</p>
        </div>

        <div className="container role-portal-grid">
          {roleLinks.map(({ href, name, text, index }) => (
            <Link key={name} href={href} className="role-portal-card reveal-card" target="_blank" rel="noopener noreferrer">
              <span className="role-portal-index">{index}</span>
              <div className="role-portal-body">
                <h3>{name}</h3>
                <p>{text}</p>
              </div>
              <span className="role-portal-arrow"><FaArrowRightLong /></span>
            </Link>
          ))}
        </div>
      </section>

      <section id="workflow" className="workflow-section">
        <div className="container section-intro">
          <span className="section-tag">How It Works</span>
          <h2>How BhuSetu Works</h2>
        </div>

        <div className="container workflow-diagram-shell">
          <div className="workflow-flowbar" aria-hidden="true">
            <span>Project Data</span>
            <span>GIS Intelligence</span>
            <span>AI Assessment</span>
            <span>Officer Action</span>
          </div>

          <div className="workflow-diagram">
            {workflowSteps.map(({ number, title, text, label, accent, icon: Icon }) => (
              <article key={number} className={`workflow-step reveal-card workflow-step--${accent}`}>
                <div className="step-flowline" aria-hidden="true" />
                <div className="step-header">
                  <div className="step-icon">
                  <Icon size={18} />
                </div>
                  <span className="step-pill">{label}</span>
                </div>

                

                <div className="step-copy">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="container workflow-note">
          <Building2 size={18} />
          <p>
            BhuSetu uses authorized GIS data where available and flags missing spatial data when a
            non-spatial prediction must be used. It does not create or modify official parcel
            boundaries.
          </p>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container section-intro">
          <span className="section-tag">Capabilities</span>
          <h2>Intelligence That Drives Timely Action</h2>
        </div>

        <div className="container feature-grid">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature-card reveal-card">
              <div className="feature-icon">
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-panel">
          <div>
            <span className="section-tag">Action</span>
            <h2>Identify Risks Early. Enable Timely Action.</h2>
            <p>
              Bring project information, geospatial intelligence, and explainable AI together to
              support better land acquisition decisions.
            </p>
          </div>

          <Link href="/roles/admin" className="primary-button large-action" target="_blank" rel="noopener noreferrer">
            Explore the Platform
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer id="contact" className="site-footer">
        <div className="container footer-shell">
          <div className="footer-brand">
            <a href="#home" className="brand footer-brand-mark" aria-label="BhuSetu home" target="_blank" rel="noopener noreferrer">
              <Image
                src="/images/logo.png"
                alt="BhuSetu"
                width={690}
                height={348}
                className="brand-logo"
              />
            </a>
            <p>AI-powered land acquisition intelligence for infrastructure planning and risk response.</p>
          </div>

          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact Us</a>
          </div>

          <div className="footer-meta">
            <p>Smart India Hackathon prototype • 2026</p>
            <p>hello@bhusetu.ai</p>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© 2026 BhuSetu. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}

