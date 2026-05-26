"use client";

import { useState, useEffect, useCallback } from "react";

type Lead = {
  id: string;
  firstName: string;
  email: string;
  country: string;
  targetArea: string;
  timeline: string;
  familyType: string;
  career: string;
  concerns: string[];
  readinessScore: number | null;
  status: string;
  pdfUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
};

const COUNTRIES = ["USA", "UK", "Canada", "Australia", "South Africa", "France", "Other"];
const STATUSES = ["pending", "generating", "completed", "failed"];

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filterCountry) params.set("country", filterCountry);
    if (filterStatus) params.set("status", filterStatus);

    const res = await fetch(`/api/admin/leads?${params}`, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "" },
    });
    const data = await res.json();
    setLeads(data.leads ?? []);
    setLoading(false);
  }, [page, filterCountry, filterStatus]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const exportCsv = () => {
    const headers = [
      "ID", "Name", "Email", "Country", "Target Area",
      "Timeline", "Family", "Career", "Score", "Status",
      "UTM Source", "UTM Medium", "UTM Campaign", "Created",
    ];
    const rows = leads.map((l) => [
      l.id, l.firstName, l.email, l.country, l.targetArea,
      l.timeline, l.familyType, l.career,
      l.readinessScore ?? "", l.status,
      l.utmSource ?? "", l.utmMedium ?? "", l.utmCampaign ?? "",
      new Date(l.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusStyle = (s: string) => {
    if (s === "completed") return "text-green-700 bg-green-50 border-green-200";
    if (s === "failed") return "text-red-700 bg-red-50 border-red-200";
    if (s === "generating") return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-gray-500 bg-gray-50 border-gray-200";
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            All navigator tool submissions
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="border-2 border-olive text-olive px-4 py-2 rounded-lg text-sm font-semibold hover:bg-olive/5 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select
          value={filterCountry}
          onChange={(e) => { setFilterCountry(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-olive/30"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-olive/30"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={fetchLeads}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Name", "Email", "Country", "Area", "Timeline", "Score", "Status", "Date", "PDF"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  No leads yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {lead.firstName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-700">{lead.country}</td>
                  <td className="px-4 py-3 text-gray-700">{lead.targetArea}</td>
                  <td className="px-4 py-3 text-gray-700">{lead.timeline}</td>
                  <td className="px-4 py-3 font-bold text-olive">
                    {lead.readinessScore ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle(lead.status)}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {lead.pdfUrl ? (
                      <a
                        href={lead.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-olive hover:underline text-xs font-medium"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-400">Page {page}</p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Previous
          </button>
          <button
            disabled={leads.length < 50}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
