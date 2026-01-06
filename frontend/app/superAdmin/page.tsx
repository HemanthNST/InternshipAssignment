"use client";

import { useState } from "react";
import { Check, X } from "phosphor-react";
import { PARKING_SITES, SITE_PERFORMANCE_DATA } from "../lib/sites";

interface DriverApproval {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  experience: string;
  status: "pending" | "approved" | "rejected";
}

const PENDING_DRIVERS: DriverApproval[] = [
  {
    id: "d1",
    name: "Alex Rodriguez",
    email: "alex@email.com",
    phone: "+1-555-1001",
    licenseNumber: "DL-2024-001",
    experience: "5 years",
    status: "pending",
  },
  {
    id: "d2",
    name: "Jessica Williams",
    email: "jessica@email.com",
    phone: "+1-555-1002",
    licenseNumber: "DL-2024-002",
    experience: "3 years",
    status: "pending",
  },
  {
    id: "d3",
    name: "Marcus Johnson",
    email: "marcus@email.com",
    phone: "+1-555-1003",
    licenseNumber: "DL-2024-003",
    experience: "7 years",
    status: "pending",
  },
];

const SITE_STATISTICS = {
  totalTickets: 127,
  totalCollection: 3250.5,
  activeParking: 24,
};

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "approvals">(
    "overview"
  );
  const [selectedSite, setSelectedSite] = useState("1");
  const [pendingDrivers, setPendingDrivers] =
    useState<DriverApproval[]>(PENDING_DRIVERS);

  const selectedSiteData = PARKING_SITES.find(site => site.id === selectedSite);
  const sitePerformance = SITE_PERFORMANCE_DATA[selectedSite];

  const handleApproveDriver = (driverId: string) => {
    alert("Driver Approved");
    setPendingDrivers(prev => prev.filter(d => d.id !== driverId));
  };

  const handleRejectDriver = (driverId: string) => {
    alert("Driver Rejected");
    setPendingDrivers(prev => prev.filter(d => d.id !== driverId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${
            activeTab === "overview"
              ? "bg-purple-600 text-white"
              : "bg-white text-purple-600 border-2 border-purple-200"
          }`}>
          Overview
        </button>
        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${
            activeTab === "approvals"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border-2 border-indigo-200"
          }`}>
          Approvals
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {activeTab === "overview" ? (
          <div className="space-y-6">
            {/* Site Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Select Site
              </label>
              <select
                value={selectedSite}
                onChange={e => setSelectedSite(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:outline-none focus:border-purple-500 bg-white font-semibold text-gray-800">
                {PARKING_SITES.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name} - {site.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Today's Performance */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Today's Performance
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 font-semibold mb-2">
                    TICKETS ISSUED
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {sitePerformance?.ticketsIssued || 0}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 font-semibold mb-2">
                    COLLECTION
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ${sitePerformance?.collection.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Statistics */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Overall Statistics
              </h2>
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-purple-500">
                  <p className="text-sm text-gray-600 font-semibold mb-1">
                    TOTAL TICKETS
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {sitePerformance?.totalTickets || 0}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-indigo-500">
                  <p className="text-sm text-gray-600 font-semibold mb-1">
                    TOTAL COLLECTION
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ${sitePerformance?.totalCollection.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-orange-500">
                  <p className="text-sm text-gray-600 font-semibold mb-1">
                    ACTIVE PARKING
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {sitePerformance?.activeParking || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Site Card */}
            {selectedSiteData && (
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 shadow-lg text-white">
                <h3 className="text-xl font-bold mb-2">
                  {selectedSiteData.name}
                </h3>
                <p className="text-purple-100 mb-4">
                  {selectedSiteData.location}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur">
                    <p className="text-xs text-purple-100 font-semibold mb-1">
                      Site ID
                    </p>
                    <p className="text-lg font-bold">{selectedSiteData.id}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur">
                    <p className="text-xs text-purple-100 font-semibold mb-1">
                      Status
                    </p>
                    <p className="text-lg font-bold">Active</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Driver Approvals Pending
            </h2>
            {pendingDrivers.length > 0 ? (
              pendingDrivers.map(driver => (
                <div
                  key={driver.id}
                  className="bg-white rounded-2xl p-5 shadow-md border-2 border-indigo-100">
                  {/* Driver Info */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-lg font-bold text-gray-800 mb-1">
                      {driver.name}
                    </p>
                    <p className="text-sm text-gray-600">{driver.email}</p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">
                        PHONE
                      </p>
                      <p className="text-gray-800 font-semibold">
                        {driver.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">
                        LICENSE
                      </p>
                      <p className="text-gray-800 font-semibold">
                        {driver.licenseNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold">
                      EXPERIENCE
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {driver.experience}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveDriver(driver.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                      <Check size={18} weight="bold" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectDriver(driver.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                      <X size={18} weight="bold" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 font-semibold">
                  No pending driver approvals
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
