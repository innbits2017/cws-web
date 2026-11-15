
"use client";

import { Fragment, useEffect, useState } from "react";
import {
  getBatches,
  getBatchDetails,
  type Batch,
  type BatchDetails,
} from "@/lib/api/batches";

const navigation = [
  { label: "Home", icon: "⌂" },
  { label: "My Batches", icon: "▤" },
  { label: "Validation", icon: "☑", expandable: true },
  { label: "Admin", icon: "⚙", expandable: true },
];

function StatusIndicator({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Processing: "bg-blue-50 text-blue-700 ring-blue-200",
    Success: "bg-green-50 text-green-700 ring-green-200",
    PartialFailed: "bg-amber-50 text-amber-700 ring-amber-200",
    Failed: "bg-red-50 text-red-700 ring-red-200",
    Cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
    "Not run": "bg-gray-100 text-gray-600 ring-gray-200",
  };

  const symbols: Record<string, string> = {
    Processing: "↻",
    Success: "✓",
    PartialFailed: "!",
    Failed: "×",
    Cancelled: "−",
    "Not run": "−",
  };

  return (
    <span
      title={status}
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold ring-1 ${
        styles[status] || styles["Not run"]
      }`}
    >
      {symbols[status] || "•"}
    </span>
  );
}

function ModeBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        enabled
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          enabled ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      {enabled ? "On" : "Off"}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SummaryCard({
  label,
  value,
  description,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${color}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
        {value}
      </div>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchDetails, setBatchDetails] = useState<
    Record<string, BatchDetails>
  >({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
    async function loadBatches() {
      try {
        const data = await getBatches();
        setBatches(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load batches"
        );
      } finally {
        setLoading(false);
      }
    }

    loadBatches();
  }, []);

  async function toggleBatch(batchId: string) {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
      return;
    }

    setExpandedBatch(batchId);

    if (batchDetails[batchId]) return;

    setLoadingDetails(true);
    setError("");

    try {
      const details = await getBatchDetails(batchId);
      setBatchDetails((previous) => ({
        ...previous,
        [batchId]: details,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load batch details"
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  const totalOrders = batches.reduce(
    (total, batch) => total + batch.batchSize,
    0
  );

  const processingCount = batches.filter(
    (batch) => batch.status === "Processing"
  ).length;

  const completedCount = batches.filter(
    (batch) => batch.status === "Success"
  ).length;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {"KONE".split("").map((letter, index) => (
              <span
                key={index}
                className="flex h-7 w-7 items-center justify-center bg-[#0755b8] text-sm font-bold text-white"
              >
                {letter}
              </span>
            ))}
          </div>
          <span className="ml-2 text-sm font-semibold text-slate-700">
            CWS Portal
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-lg"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
            <div className="flex gap-0.5">
              {"KONE".split("").map((letter, index) => (
                <span
                  key={index}
                  className="flex h-8 w-8 items-center justify-center bg-[#0755b8] text-base font-bold text-white"
                >
                  {letter}
                </span>
              ))}
            </div>
            <span className="text-xs font-semibold tracking-wider text-slate-400">
              CWS PORTAL
            </span>
          </div>

          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                SYSTEM CONNECTION
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Connected
              </span>
            </div>
          </div>

          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-700">
                👤
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  Demo Engineer
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  demo.engineer@example.com
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Active session
            </div>
          </div>

          <div className="px-4 pb-2 pt-5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Workspace
            </p>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {navigation.map((item) => {
              const active = activeNav === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveNav(item.label);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                    active
                      ? "bg-blue-50 font-semibold text-[#0755b8]"
                      : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center text-lg">
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.expandable && (
                    <span className="text-xs text-slate-400">⌄</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <p className="text-xs font-medium text-slate-500">CWS Web 2.0</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Demo environment · Local
            </p>
          </div>
        </aside>

        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <button
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          />
        )}

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Desktop topbar */}
          <div className="hidden h-[76px] items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">
            <div>
              <p className="text-xs text-slate-400">
                Workspace / Dashboard
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Configuration Management
              </p>
            </div>

            <div className="flex items-center gap-5">
              <span className="text-xs text-slate-500">
                Local environment
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                DE
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
            {/* Page heading */}
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>Home</span>
                  <span>/</span>
                  <span className="text-slate-600">Latest batches</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-[28px]">
                  Latest batches
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor, manage and track your batch executions.
                </p>
              </div>

              <button
                onClick={() =>
                  alert("New Batch functionality will be implemented next.")
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0755b8] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#06469a] hover:shadow-md"
              >
                <span className="text-lg">+</span>
                New Batch
              </button>
            </div>

            {/* Summary cards */}
            <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total batches"
                value={batches.length}
                description="Available in this workspace"
                icon="▤"
                color="bg-blue-50 text-blue-700"
              />
              <SummaryCard
                label="Total orders"
                value={totalOrders}
                description="Across all available batches"
                icon="▦"
                color="bg-violet-50 text-violet-700"
              />
              <SummaryCard
                label="Processing"
                value={processingCount}
                description="Currently being processed"
                icon="↻"
                color="bg-amber-50 text-amber-700"
              />
              <SummaryCard
                label="Successful"
                value={completedCount}
                description="Successfully completed batches"
                icon="✓"
                color="bg-green-50 text-green-700"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Batch table */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Batch overview
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {batches.length} records found
                  </p>
                </div>
                <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                  All batches
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                  <p className="mt-3 text-sm text-slate-500">
                    Loading batch information...
                  </p>
                </div>
              ) : (
                <div className="dashboard-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[1120px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#f3f7fc] text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-4">Batch details</th>
                        <th className="px-3 py-4 text-center">Status</th>
                        <th className="px-3 py-4">Material / KM</th>
                        <th className="px-3 py-4 text-center">Results</th>
                        <th className="px-3 py-4 text-center">Error mode</th>
                        <th className="px-3 py-4 text-center">Skip mode</th>
                        <th className="px-3 py-4 text-center">Success rate</th>
                        <th className="px-3 py-4">Last run</th>
                        <th className="px-3 py-4 text-center">Size</th>
                        <th className="px-3 py-4 text-center">Shared</th>
                        <th className="px-3 py-4 text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {batches.map((batch) => {
                        const isExpanded =
                          expandedBatch === batch.batchId;
                        const details = batchDetails[batch.batchId];

                        return (
                          <Fragment key={batch.batchId}>
                            <tr className="border-t border-slate-100 transition hover:bg-blue-50/40">
                              <td className="max-w-[300px] px-5 py-4">
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={() =>
                                      toggleBatch(batch.batchId)
                                    }
                                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-blue-600 hover:bg-blue-100"
                                    aria-label="Expand batch"
                                  >
                                    <span className="text-xs">
                                      {isExpanded ? "▼" : "▶"}
                                    </span>
                                  </button>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-800">
                                      {batch.batchId}
                                    </p>
                                    <p className="mt-0.5 break-words text-xs text-slate-500">
                                      {batch.name}
                                    </p>
                                    <p className="mt-2 text-[11px] text-slate-400">
                                      {batch.ownerDisplayName} ·{" "}
                                      {formatDate(batch.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-3 py-4 text-center">
                                <StatusIndicator status={batch.status} />
                              </td>

                              <td className="max-w-[220px] px-3 py-4">
                                <p className="font-medium text-slate-700">
                                  {batch.materialCode}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Revision {batch.materialRevision}
                                </p>
                              </td>

                              <td className="px-3 py-4 text-center">
                                <button
                                  title="Download result files"
                                  className="text-lg text-slate-400 hover:text-blue-600"
                                >
                                  ↓
                                </button>
                              </td>

                              <td className="px-3 py-4 text-center">
                                <ModeBadge enabled={batch.errorMode} />
                              </td>

                              <td className="px-3 py-4 text-center">
                                <ModeBadge enabled={batch.skipMode} />
                              </td>

                              <td className="px-3 py-4 text-center">
                                <span className="font-semibold text-slate-700">
                                  {Number(batch.successRate).toFixed(2)}%
                                </span>
                              </td>

                              <td className="px-3 py-4 text-xs text-slate-500">
                                {formatDate(batch.lastRunAt)}
                              </td>

                              <td className="px-3 py-4 text-center font-semibold text-slate-700">
                                {batch.batchSize}
                              </td>

                              <td className="px-3 py-4 text-center">
                                <span className="text-xs text-slate-500">
                                  {batch.shared ? "Yes" : "No"}
                                </span>
                              </td>

                              <td className="px-3 py-4 text-center">
                                <button
                                  onClick={() =>
                                    toggleBatch(batch.batchId)
                                  }
                                  className="rounded-md px-2 py-1 text-lg text-slate-400 hover:bg-slate-100 hover:text-blue-700"
                                  title="View details"
                                >
                                  ⋯
                                </button>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr>
                                <td colSpan={11} className="p-0">
                                  <div className="border-y border-blue-100 bg-[#f8fbff]">
                                    <div className="flex items-center justify-between border-b border-blue-100 px-5 py-3">
                                      <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                          Order details
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                          Batch {batch.batchId}
                                        </p>
                                      </div>
                                      {details && (
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                          {details.orderCount} orders
                                        </span>
                                      )}
                                    </div>

                                    {loadingDetails && !details ? (
                                      <div className="p-8 text-center text-sm text-slate-500">
                                        Loading order details...
                                      </div>
                                    ) : details ? (
                                      <div className="dashboard-scrollbar overflow-x-auto">
                                        <table className="w-full min-w-[900px] text-sm">
                                          <thead>
                                            <tr className="bg-[#edf4fc] text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                              <th className="px-5 py-3">Test order</th>
                                              <th className="px-4 py-3">Configuration</th>
                                              <th className="px-4 py-3 text-center">Order status</th>
                                              <th className="px-4 py-3">Error message</th>
                                              <th className="px-4 py-3 text-center">CAD time</th>
                                              <th className="px-4 py-3 text-center">Regeneration loops</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {details.orders.map((order) => (
                                              <tr
                                                key={order.orderId}
                                                className="border-t border-slate-100 bg-white hover:bg-blue-50/50"
                                              >
                                                <td className="px-5 py-3 font-medium text-blue-700">
                                                  {order.orderId}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                  {order.configurationId || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                  <StatusIndicator status={order.orderStatus} />
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                  {order.errorModeMessage || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-600">
                                                  {order.cadConfigurationSeconds != null
                                                    ? `${Math.floor(order.cadConfigurationSeconds / 60)}m ${order.cadConfigurationSeconds % 60}s`
                                                    : "—"}
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-600">
                                                  {order.cadRegenerationLoops}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}

                      {batches.length === 0 && (
                        <tr>
                          <td colSpan={11} className="p-12 text-center text-slate-400">
                            No batches available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-white px-5 py-3">
                <p className="text-xs text-slate-400">
                  Showing {batches.length} batch records
                </p>
                <p className="text-xs text-slate-400">
                  CWS Web 2.0 · Demo
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
