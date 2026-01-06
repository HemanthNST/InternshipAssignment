"use client";

import { useState, useEffect } from "react";
import { adminAPI, testAPI } from "../lib/api";
import { CheckCircle, XCircle, User, ChartLine, MapPin } from "phosphor-react";

interface Approval {
  id: string;
  driverId: string;
  driverName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface SiteStats {
  siteId: string;
  siteName: string;
  totalSessions: number;
  revenue: number;
  activeValets: number;
}

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"approvals" | "stats">(
    "approvals"
  );
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [stats, setStats] = useState<SiteStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch test admin first (for development)
        try {
          await testAPI.getTestAdmin();
        } catch (err) {
          console.warn("Could not fetch test admin");
        }

        // Fetch pending approvals
        try {
          const approvalsRes = await adminAPI.getAllApprovals();
          console.log("📋 Raw approvals response:", approvalsRes);

          // Transform approvals data
          const transformedApprovals =
            approvalsRes.data?.map((approval: any) => ({
              id: approval.id,
              driverId: approval.id,
              driverName: approval.name || "Unknown",
              status: approval.status || "pending",
              createdAt: approval.submittedat || new Date().toISOString(),
            })) || [];

          console.log("✅ Transformed approvals:", transformedApprovals);
          setApprovals(transformedApprovals);
        } catch (err: any) {
          console.warn("Could not fetch approvals:", err);
          setApprovals([]);
        }

        // Fetch site stats
        try {
          const sitesRes = await adminAPI.getAllSites();
          console.log("🏢 Raw sites response:", sitesRes);
          const sitesData = sitesRes.data || [];

          if (sitesData.length === 0) {
            console.warn("⚠️ No sites returned from API");
            setStats([]);
          } else {
            // Fetch stats for each site
            const statsPromises = sitesData.map((site: any) =>
              adminAPI.getSiteStats(site.id).then((res: any) => {
                console.log(`📊 Stats for site ${site.id}:`, res);
                // The response is the stats data directly, not wrapped in .data
                const data = res.data || res;
                console.log(`📊 Extracted data for site ${site.name}:`, data);
                return {
                  siteId: site.id,
                  siteName: site.name || "Unknown Site",
                  totalSessions: data?.totaltickets || data?.totalsessions || 0,
                  revenue: data?.totalcollection || data?.revenue || 0,
                  activeValets: data?.activevalets || data?.activecars || 0,
                };
              })
            );

            const statsData = await Promise.all(statsPromises);
            console.log("📊 Transformed site stats:", statsData);
            setStats(statsData || []);
          }
        } catch (err: any) {
          console.error("Could not fetch site stats:", err);
          setStats([]);
        }

        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch admin data:", err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (approval: Approval) => {
    try {
      await adminAPI.approveDriver(approval.id);
      setApprovals(
        approvals.map(a =>
          a.id === approval.id ? { ...a, status: "approved" } : a
        )
      );
      alert("Driver approved successfully");
    } catch (err: any) {
      console.error("Failed to approve driver:", err);
      alert("Failed to approve driver");
    }
  };

  const handleReject = async (approval: Approval) => {
    try {
      await adminAPI.rejectDriver(approval.id);
      setApprovals(
        approvals.map(a =>
          a.id === approval.id ? { ...a, status: "rejected" } : a
        )
      );
      alert("Driver rejected successfully");
    } catch (err: any) {
      console.error("Failed to reject driver:", err);
      alert("Failed to reject driver");
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <ChartLine size={48} className="text-purple-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingApprovals = approvals.filter(a => a.status === "pending");
  const approvedDrivers = approvals.filter(a => a.status === "approved");
  const rejectedDrivers = approvals.filter(a => a.status === "rejected");

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold mb-1">Super Admin Dashboard</h1>
        <p className="text-purple-100">
          Manage drivers, approvals, and system analytics
        </p>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 flex-1 overflow-y-auto">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-xs text-red-600 font-semibold mb-1">
              PENDING APPROVALS
            </p>
            <p className="text-3xl font-bold text-red-900">
              {pendingApprovals.length}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs text-green-600 font-semibold mb-1">
              APPROVED DRIVERS
            </p>
            <p className="text-3xl font-bold text-green-900">
              {approvedDrivers.length}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-xs text-purple-600 font-semibold mb-1">
              TOTAL SITES
            </p>
            <p className="text-3xl font-bold text-purple-900">{stats.length}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-600 font-semibold mb-1">
              TOTAL REVENUE
            </p>
            <p className="text-3xl font-bold text-blue-900">
              ₹{stats.reduce((sum, s) => sum + (s.revenue || 0), 0)}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-4 py-3 font-semibold transition-all border-b-2 ${
              activeTab === "approvals"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}>
            Driver Approvals
            {pendingApprovals.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingApprovals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-3 font-semibold transition-all border-b-2 ${
              activeTab === "stats"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}>
            Site Statistics
          </button>
        </div>

        {/* Content */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            {/* Pending Approvals */}
            {pendingApprovals.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Pending Approvals ({pendingApprovals.length})
                </h3>
                <div className="space-y-3 mb-6">
                  {pendingApprovals.map(approval => (
                    <div
                      key={approval.id}
                      className="bg-white border-2 border-yellow-300 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <User size={24} className="text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {approval.driverName}
                            </h4>
                            <p className="text-xs text-gray-600">
                              Applied on{" "}
                              {new Date(
                                approval.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                          Pending
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(approval)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2">
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(approval)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2">
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Drivers */}
            {approvedDrivers.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Approved Drivers ({approvedDrivers.length})
                </h3>
                <div className="space-y-2">
                  {approvedDrivers.map(approval => (
                    <div
                      key={approval.id}
                      className="bg-white border border-green-200 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {approval.driverName}
                        </p>
                        <p className="text-xs text-gray-600">
                          Approved on{" "}
                          {new Date(approval.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                        Active
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {approvals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No driver approvals to manage</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Site Performance ({stats.length})
            </h3>
            {stats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No site data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.map(site => (
                  <div
                    key={site.siteId}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {site.siteName}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {site.activeValets} valets active
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-semibold mb-1">
                          TOTAL SESSIONS
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {site.totalSessions}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-semibold mb-1">
                          REVENUE
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          ₹{site.revenue}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
