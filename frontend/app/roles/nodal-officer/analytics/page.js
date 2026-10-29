"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Filter,
  Gauge,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  Doughnut,
  Line,
} from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

import { Header } from "@/app/component/layout/index";
import {
  PROJECTS,
  districtOptions,
  projectTypeOptions,
  riskOptions,
  statusOptions,
} from "../../project-officer/my-project/projects-data";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

const delayDrivers = [
  "Legal Disputes",
  "Compensation",
  "Ownership",
  "R&R",
  "Approvals",
  "Possession",
  "GIS/Data gaps",
];

const chartPalette = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
  neutral: "#cbd5e1",
  accent: "#0f172a",
};

const trendBadge = (value) => {
  if (value >= 0) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-red-200 bg-red-50 text-red-700";
};

const isWithinDateRange = (date, range) => {
  const target = new Date(date);
  const now = new Date("2026-09-11T00:00:00");

  if (range === "All") return true;
  if (range === "Last 30 days") {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    return target >= cutoff;
  }
  if (range === "Last 90 days") {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 90);
    return target >= cutoff;
  }
  if (range === "Last 6 months") {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 6);
    return target >= cutoff;
  }

  return true;
};

const getDriverForProject = (project) => {
  const index = project.id % delayDrivers.length;
  return delayDrivers[index];
};

const getTrendValue = (project) => {
  if (project.riskProbability >= 75) return 12;
  if (project.riskProbability <= 35) return -8;
  return 3;
};

function StatCard({ label, value, subtext, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {subtext ? <p className="mt-3 text-xs text-slate-500">{subtext}</p> : null}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Page() {
  const [dateRange, setDateRange] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [driverFilter, setDriverFilter] = useState("All");

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((project) => {
      const matchesDate = isWithinDateRange(project.updatedAt, dateRange);
      const matchesDistrict = districtFilter === "All" || project.district === districtFilter;
      const matchesType = typeFilter === "All" || project.type === typeFilter;
      const matchesRisk = riskFilter === "All" || project.riskCategory === riskFilter;
      const matchesStatus = statusFilter === "All" || project.status === statusFilter;
      const matchesDriver = driverFilter === "All" || getDriverForProject(project) === driverFilter;

      return matchesDate && matchesDistrict && matchesType && matchesRisk && matchesStatus && matchesDriver;
    });
  }, [dateRange, districtFilter, driverFilter, riskFilter, statusFilter, typeFilter]);

  const totalProjects = filteredProjects.length;
  const averageRisk = totalProjects
    ? Math.round(filteredProjects.reduce((sum, project) => sum + project.riskProbability, 0) / totalProjects)
    : 0;
  const highCriticalCount = filteredProjects.filter((project) => ["High", "Critical"].includes(project.riskCategory)).length;
  const highCriticalPct = totalProjects ? Math.round((highCriticalCount / totalProjects) * 100) : 0;
  const overallTrend = totalProjects
    ? filteredProjects.reduce((sum, project) => sum + getTrendValue(project), 0)
    : 0;
  const overallTrendLabel = overallTrend >= 0 ? "Increasing" : "Decreasing";

  const distribution = useMemo(() => {
    return ["Low", "Medium", "High", "Critical"].map((category) => {
      const count = filteredProjects.filter((project) => project.riskCategory === category).length;
      return {
        category,
        count,
        percentage: totalProjects ? Math.round((count / totalProjects) * 100) : 0,
      };
    });
  }, [filteredProjects, totalProjects]);

  const driverStats = useMemo(() => {
    return delayDrivers
      .map((driver) => {
        const count = filteredProjects.filter((project) => getDriverForProject(project) === driver).length;
        return {
          driver,
          count,
          percentage: totalProjects ? Math.round((count / totalProjects) * 100) : 0,
        };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredProjects, totalProjects]);

  const districtStats = useMemo(() => {
    return [...new Set(filteredProjects.map((project) => project.district))]
      .map((district) => {
        const districtProjects = filteredProjects.filter((project) => project.district === district);
        const avgRisk = districtProjects.reduce((sum, project) => sum + project.riskProbability, 0) / districtProjects.length;
        const highCritical = districtProjects.filter((project) => ["High", "Critical"].includes(project.riskCategory)).length;
        return {
          district,
          avgRisk: Math.round(avgRisk),
          highCriticalCount: highCritical,
          count: districtProjects.length,
        };
      })
      .sort((a, b) => b.avgRisk - a.avgRisk)
      .slice(0, 6);
  }, [filteredProjects]);

  const riskTrend = useMemo(() => {
    const monthMap = new Map();

    filteredProjects.forEach((project) => {
      const date = new Date(project.updatedAt);
      const key = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(date);
      const existing = monthMap.get(key) || [];
      existing.push(project.riskProbability);
      monthMap.set(key, existing);
    });

    const labels = [...monthMap.keys()].sort((a, b) => new Date(a) - new Date(b));

    if (!labels.length) {
      return {
        labels: ["May", "Jun", "Jul", "Aug", "Sep"],
        values: [42, 48, 52, 55, 58],
      };
    }

    return {
      labels,
      values: labels.map((label) => {
        const values = monthMap.get(label);
        return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
      }),
    };
  }, [filteredProjects]);

  const interventionImpact = useMemo(() => {
    const items = filteredProjects
      .filter((project) => ["Completed", "Under Acquisition", "On Hold", "Pending LAO Verification"].includes(project.status))
      .slice(0, 6);

    return {
      labels: items.map((project) => project.projectId),
      before: items.map((project) => {
        if (project.status === "Completed") return Math.min(95, project.riskProbability + 20);
        if (project.status === "On Hold") return project.riskProbability + 12;
        if (project.status === "Under Acquisition") return project.riskProbability + 10;
        return project.riskProbability + 6;
      }),
      after: items.map((project) => project.riskProbability),
    };
  }, [filteredProjects]);

  const riskChartData = useMemo(() => ({
    labels: distribution.map((item) => item.category),
    datasets: [
      {
        data: distribution.map((item) => item.count),
        backgroundColor: distribution.map((item) => chartPalette[item.category] || chartPalette.neutral),
        borderColor: "#f8fafc",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }), [distribution]);

  const driverChartData = useMemo(() => ({
    labels: driverStats.map((item) => item.driver),
    datasets: [
      {
        data: driverStats.map((item) => item.count),
        backgroundColor: [
          "#1e293b",
          "#475569",
          "#64748b",
          "#94a3b8",
          "#cbd5e1",
          "#f59e0b",
          "#ef4444",
        ],
        borderColor: "#f8fafc",
        borderWidth: 2,
      },
    ],
  }), [driverStats]);

  const districtChartData = useMemo(() => ({
    labels: districtStats.map((item) => item.district),
    datasets: [
      {
        label: "Average risk %",
        data: districtStats.map((item) => item.avgRisk),
        backgroundColor: "#0f172a",
        borderRadius: 8,
      },
      {
        label: "High/Critical projects",
        data: districtStats.map((item) => item.highCriticalCount),
        backgroundColor: "#f59e0b",
        borderRadius: 8,
      },
    ],
  }), [districtStats]);

  const riskTrendChartData = useMemo(() => ({
    labels: riskTrend.labels,
    datasets: [
      {
        label: "Average project risk",
        data: riskTrend.values,
        borderColor: "#0f172a",
        backgroundColor: "rgba(15, 23, 42, 0.08)",
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: "#0f172a",
        pointRadius: 4,
      },
    ],
  }), [riskTrend]);

  const interventionChartData = useMemo(() => ({
    labels: interventionImpact.labels,
    datasets: [
      {
        label: "Before intervention",
        data: interventionImpact.before,
        backgroundColor: "#cbd5e1",
        borderRadius: 8,
      },
      {
        label: "After intervention",
        data: interventionImpact.after,
        backgroundColor: "#0f172a",
        borderRadius: 8,
      },
    ],
  }), [interventionImpact]);

  const insightSummary = useMemo(() => {
    const dominantDriver = driverStats[0]?.driver || "Legal Disputes";
    const mostAtRiskDistrict = districtStats[0]?.district || "Ghaziabad";
    const avgChange = riskTrend.values.length > 1 ? riskTrend.values[riskTrend.values.length - 1] - riskTrend.values[0] : 0;

    return {
      dominantDriver,
      mostAtRiskDistrict,
      avgChange,
    };
  }, [driverStats, districtStats, riskTrend]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          color: "#475569",
          boxWidth: 8,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.94)",
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        borderWidth: 0,
        padding: 10,
        displayColors: true,
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: "60%",
    onClick: (_, elements) => {
      if (!elements.length) return;
      const index = elements[0].index;
      const label = distribution[index]?.category;
      if (label) setRiskFilter(label);
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0) || 1;
            const value = context.parsed;
            const percent = Math.round((value / total) * 100);
            return `${context.label}: ${value} projects (${percent}%)`;
          },
        },
      },
    },
  };

  const districtChartOptions = {
    ...chartOptions,
    onClick: (_, elements) => {
      if (!elements.length) return;
      const index = elements[0].index;
      const district = districtStats[index]?.district;
      if (district) setDistrictFilter(district);
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label;
            if (label === "Average risk %") return `${label}: ${context.parsed.y}% average risk`;
            return `${label}: ${context.parsed.y} projects`;
          },
        },
      },
    },
  };

  const driverChartOptions = {
    ...chartOptions,
    onClick: (_, elements) => {
      if (!elements.length) return;
      const index = elements[0].index;
      const driver = driverStats[index]?.driver;
      if (driver) setDriverFilter(driver);
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed} projects (${driverStats[context.dataIndex]?.percentage || 0}%)`,
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => `Average project risk: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        ticks: {
          color: "#475569",
          callback: (value) => `${value}%`,
        },
        grid: {
          color: "#e2e8f0",
        },
      },
      x: {
        ticks: {
          color: "#475569",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const interventionOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}% risk`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 100,
        ticks: {
          color: "#475569",
          callback: (value) => `${value}%`,
        },
        grid: {
          color: "#e2e8f0",
        },
      },
      x: {
        ticks: {
          color: "#475569",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header title="Analytics" />

      <main className="mx-auto max-w-8xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Predictive intelligence</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Risk and Intervention Analytics</h1>
            <p className="mt-2 text-sm text-slate-600">Portfolio patterns, concentration, trend movement, and intervention effectiveness.</p>
          </div>
        </div>

        {/* <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-1 flex-wrap items-end gap-2">
              <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/5">
                <FilterSelect label="Date Range" value={dateRange} onChange={setDateRange} options={["All", "Last 30 days", "Last 90 days", "Last 6 months"]} />
              </div>
              <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/5">
                <FilterSelect label="District" value={districtFilter} onChange={setDistrictFilter} options={["All", ...districtOptions]} />
              </div>
              <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/5">
                <FilterSelect label="Project Type" value={typeFilter} onChange={setTypeFilter} options={["All", ...projectTypeOptions.filter((item) => item !== "All")]} />
              </div>
              <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/5">
                <FilterSelect label="Risk Category" value={riskFilter} onChange={setRiskFilter} options={["All", ...riskOptions.filter((item) => item !== "All")]} />
              </div>
              <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/5">
                <FilterSelect label="Project Status" value={statusFilter} onChange={setStatusFilter} options={["All", ...statusOptions.filter((item) => item !== "All")]} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDateRange("All");
                setDistrictFilter("All");
                setTypeFilter("All");
                setRiskFilter("All");
                setStatusFilter("All");
                setDriverFilter("All");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <Filter className="h-4 w-4" />
              Reset filters
            </button>
          </div>
        </section> */}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Projects"
            value={totalProjects}
            subtext="Across filtered portfolio"
            icon={BarChart3}
            accent="border-slate-200 bg-slate-100 text-slate-700"
          />
          <StatCard
            label="Average Risk"
            value={`${averageRisk}%`}
            subtext={`${overallTrendLabel} portfolio trend`}
            icon={Gauge}
            accent="border-amber-200 bg-amber-50 text-amber-700"
          />
          <StatCard
            label="High/Critical"
            value={`${highCriticalPct}%`}
            subtext={`${highCriticalCount} projects`}
            icon={ShieldAlert}
            accent="border-red-200 bg-red-50 text-red-700"
          />
          <StatCard
            label="Risk Trend"
            value={overallTrendLabel}
            subtext={`${overallTrend >= 0 ? "+" : ""}${overallTrend} trend index`}
            icon={overallTrend >= 0 ? TrendingUp : TrendingDown}
            accent={trendBadge(overallTrend)}
          />
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Risk Distribution</p>
              <span className="text-xs text-slate-500">{totalProjects} projects</span>
            </div>
            <div className="mt-4 h-72">
              <Doughnut data={riskChartData} options={doughnutOptions} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">District-wise Risk</p>
              <span className="text-xs text-slate-500">Average risk by district</span>
            </div>
            <div className="mt-4 h-72">
              <Bar data={districtChartData} options={districtChartOptions} />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Top Delay Drivers</p>
            <div className="mt-4 h-72">
              <Doughnut data={driverChartData} options={driverChartOptions} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Risk Trend</p>
              <span className="text-xs text-slate-500">Average risk over time</span>
            </div>
            <div className="mt-4 h-72">
              <Line data={riskTrendChartData} options={lineChartOptions} />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Intervention Impact</p>
            <span className="text-xs text-slate-500">Risk before and after intervention snapshot</span>
          </div>
          <div className="mt-4 h-72">
            <Bar data={interventionChartData} options={interventionOptions} />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <Sparkles className="h-4 w-4" />
            Portfolio view
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Dominant driver:</span> {insightSummary.dominantDriver}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Most at-risk district:</span> {insightSummary.mostAtRiskDistrict}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Trend change:</span> {insightSummary.avgChange >= 0 ? "+" : ""}{insightSummary.avgChange}%
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
