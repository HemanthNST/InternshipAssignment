"use client";

import { useState, useEffect } from "react";
import { managerAPI } from "../lib/api";
import {
  MagnifyingGlass,
  SortAscending,
  MapPin,
  Clock,
  Car,
  CheckCircle,
  X,
} from "phosphor-react";

interface ParkingSession {
  id: string;
  ticketId: string;
  status: "parked" | "in-progress" | "retrieved";
  createdAt: string;
  updatedAt: string;
  site?: { id: string; name: string; location: string };
  vehicle?: { number: string; model: string };
  valet?: { id: string; name: string };
}

interface Valet {
  id: string;
  name: string;
  phone: string;
  status: string;
}

export default function ManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");

  const [parkingSessions, setParkingSessions] = useState<ParkingSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ParkingSession[]>(
    []
  );
  const [valets, setValets] = useState<Record<string, Valet[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ParkingSession | null>(
    null
  );
  const [selectedValetId, setSelectedValetId] = useState<string>("");

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await managerAPI.getSessions();
        setParkingSessions(response.data);
        setFilteredSessions(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch sessions:", err);
        setError("Failed to load parking sessions");
        setParkingSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Filter sessions whenever search or filters change
  useEffect(() => {
    let filtered = parkingSessions;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    // Filter by site
    if (selectedSite !== "all") {
      filtered = filtered.filter(s => s.site?.id === selectedSite);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.ticketId?.toLowerCase().includes(query) ||
          s.vehicle?.number?.toLowerCase().includes(query) ||
          s.site?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredSessions(filtered);
  }, [searchQuery, selectedStatus, selectedSite, parkingSessions]);

  const handleReassignClick = async (session: ParkingSession) => {
    setSelectedSession(session);
    setShowReassignModal(true);

    // Fetch valets for this site if not already loaded
    if (session.site && !valets[session.site.id]) {
      try {
        const response = await managerAPI.getValetsBySite(session.site.id);
        setValets(prev => ({
          ...prev,
          [session.site!.id]: response.data,
        }));
      } catch (err: any) {
        console.error("Failed to fetch valets:", err);
      }
    }
  };

  const handleConfirmReassign = async () => {
    if (!selectedSession || !selectedValetId) return;

    try {
      await managerAPI.reassignValet(selectedSession.id, selectedValetId);

      // Find the selected valet name
      const selectedValetName = selectedSession.site
        ? valets[selectedSession.site.id]?.find(v => v.id === selectedValetId)
            ?.name || "New Valet"
        : "New Valet";

      // Update local state
      setParkingSessions(
        parkingSessions.map(s =>
          s.id === selectedSession.id
            ? { ...s, valet: { id: selectedValetId, name: selectedValetName } }
            : s
        )
      );

      setShowReassignModal(false);
      setSelectedSession(null);
      setSelectedValetId("");
      alert("Valet reassigned successfully");
    } catch (err: any) {
      console.error("Failed to reassign valet:", err);
      alert("Failed to reassign valet. Please try again.");
    }
  };

  const uniqueSites = Array.from(
    new Map(
      parkingSessions.filter(s => s.site).map(s => [s.site!.id, s.site!])
    ).values()
  );

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Car size={48} className="text-blue-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading parking sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold mb-1">Manager Dashboard</h1>
        <p className="text-blue-100">Manage parking sessions and valets</p>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 flex-1 overflow-y-auto">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass
              size={20}
              className="absolute left-4 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by ticket ID, vehicle, or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="flex gap-2">
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap py-2">
                Status:
              </span>
              {["all", "parked", "in-progress", "retrieved"].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedStatus === status
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}>
                  {status === "all"
                    ? "All"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap py-2">
                Site:
              </span>
              <button
                onClick={() => setSelectedSite("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSite === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                All Sites
              </button>
              {uniqueSites.map(site => (
                <button
                  key={site.id}
                  onClick={() => setSelectedSite(site.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSite === site.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}>
                  {site.name.split(",")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredSessions.length} of {parkingSessions.length} sessions
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">No parking sessions found</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border-l-4"
                style={{
                  borderColor:
                    session.status === "retrieved"
                      ? "#10b981"
                      : session.status === "parked"
                      ? "#f59e0b"
                      : "#3b82f6",
                }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">
                      {session.vehicle?.model}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Car size={14} />
                      {session.vehicle?.number}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                        session.status === "retrieved"
                          ? "bg-green-100 text-green-800"
                          : session.status === "parked"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                      {session.status.charAt(0).toUpperCase() +
                        session.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{session.site?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{new Date(session.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>
                      {session.valet?.name || "Unassigned"} • Ticket:{" "}
                      {session.ticketId}
                    </span>
                  </div>
                </div>

                {session.status !== "retrieved" && (
                  <button
                    onClick={() => handleReassignClick(session)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all">
                    {session.valet?.name ? "Reassign Valet" : "Assign Valet"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Reassign Valet
              </h3>
              <button
                onClick={() => setShowReassignModal(false)}
                className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Session Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Vehicle</p>
              <p className="font-bold text-gray-800 mb-3">
                {selectedSession.vehicle?.model} (
                {selectedSession.vehicle?.number})
              </p>
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="font-bold text-gray-800 mb-3">
                {selectedSession.site?.name}
              </p>
              <p className="text-xs text-gray-500 mb-1">Current Valet</p>
              <p className="font-bold text-gray-800">
                {selectedSession.valet?.name || "Unassigned"}
              </p>
            </div>

            {/* Valet Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Select New Valet
              </label>
              {selectedSession.site &&
              valets[selectedSession.site.id] &&
              valets[selectedSession.site.id].length > 0 ? (
                <div className="space-y-2">
                  {valets[selectedSession.site.id].map(valet => (
                    <button
                      key={valet.id}
                      onClick={() => setSelectedValetId(valet.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedValetId === valet.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}>
                      <p className="font-semibold text-gray-800">
                        {valet.name}
                      </p>
                      <p className="text-xs text-gray-600">{valet.phone}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No valets available for this site
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReassignModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition-all">
                Cancel
              </button>
              <button
                onClick={handleConfirmReassign}
                disabled={!selectedValetId}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg transition-all">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
