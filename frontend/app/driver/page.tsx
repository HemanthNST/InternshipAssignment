"use client";

import { useState, useEffect } from "react";
import { assignmentAPI, testAPI } from "../lib/api";
import { Bell, Car, MapPin, Clock, CheckCircle, X } from "phosphor-react";

interface Assignment {
  id: string;
  driverId: string;
  sessionId: string;
  type: "park" | "retrieve";
  status: "pending" | "accepted" | "completed";
  createdAt: string;
  updatedAt: string;
  parkingSession?: {
    id: string;
    ticketId: string;
    status: string;
    vehicle?: { number: string; model: string };
    site?: { name: string; location: string };
    valet?: { name: string };
  };
}

interface DriverStats {
  totalParkings: number;
  totalRetrievals: number;
  currentlyParked: number;
  totalEarnings: number;
}

export default function DriverPage() {
  const [driverId, setDriverId] = useState<string | null>(null);

  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showParkingModal, setShowParkingModal] = useState(false);
  const [parkingStep, setParkingStep] = useState<"loading" | "success">(
    "loading"
  );

  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(
    null
  );
  const [stats, setStats] = useState<DriverStats>({
    totalParkings: 0,
    totalRetrievals: 0,
    currentlyParked: 0,
    totalEarnings: 0,
  });

  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const newAssignments = allAssignments.filter(a => a.status === "pending");
  const acceptedAssignments = allAssignments.filter(
    a => a.status === "accepted"
  );

  // Fetch test driver on mount
  useEffect(() => {
    const fetchTestDriver = async () => {
      try {
        const res = await testAPI.getTestDriver();
        const testDriverId = res.data.id;
        setDriverId(testDriverId);
        localStorage.setItem("testDriverId", testDriverId);
      } catch (err: any) {
        console.error("Failed to fetch test driver:", err);
        setError("Failed to load driver");
      }
    };

    fetchTestDriver();
  }, []);

  // Fetch assignments and stats when driverId is available
  useEffect(() => {
    if (!driverId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [assignmentsRes, statsRes] = await Promise.all([
          assignmentAPI.getDriverAssignments(driverId),
          assignmentAPI.getDriverStats(driverId),
        ]);

        setAllAssignments(assignmentsRes.data);
        setStats(statsRes.data);

        // Set first assignment if available
        if (assignmentsRes.data.length > 0) {
          setCurrentAssignment(assignmentsRes.data[0]);
        }

        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch driver data:", err);
        setError("Failed to load assignments");
        setAllAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [driverId]);

  const handleAcceptAssignment = async (assignment: Assignment) => {
    try {
      await assignmentAPI.acceptAssignment(assignment.id);

      // Update local state
      setCurrentAssignment(assignment);
      setAllAssignments(
        allAssignments.map(a =>
          a.id === assignment.id ? { ...a, status: "accepted" } : a
        )
      );
      setShowAssignmentsModal(false);
    } catch (err: any) {
      console.error("Failed to accept assignment:", err);
      alert("Failed to accept assignment. Please try again.");
    }
  };

  const handleStartParking = async () => {
    if (!currentAssignment) return;

    setShowParkingModal(true);
    setParkingStep("loading");

    try {
      await assignmentAPI.completeAssignment(currentAssignment.id);

      // Update local state
      setAllAssignments(
        allAssignments.map(a =>
          a.id === currentAssignment.id ? { ...a, status: "completed" } : a
        )
      );

      // Update stats
      if (currentAssignment.type === "park") {
        setStats(prev => ({
          ...prev,
          totalParkings: prev.totalParkings + 1,
          currentlyParked: prev.currentlyParked + 1,
        }));
      } else {
        setStats(prev => ({
          ...prev,
          totalRetrievals: prev.totalRetrievals + 1,
          currentlyParked: Math.max(0, prev.currentlyParked - 1),
        }));
      }

      setParkingStep("success");

      // Auto close and move to next assignment after 1.5 seconds
      setTimeout(() => {
        setShowParkingModal(false);

        const nextPending = allAssignments.find(
          a => a.status === "pending" && a.id !== currentAssignment.id
        );
        const nextAccepted = acceptedAssignments.find(
          a => a.id !== currentAssignment.id
        );

        if (nextPending) {
          setCurrentAssignment(nextPending);
        } else if (nextAccepted) {
          setCurrentAssignment(nextAccepted);
        } else {
          // No more assignments
          setCurrentAssignment(null);
        }
      }, 1500);
    } catch (err: any) {
      console.error("Failed to complete assignment:", err);
      alert("Failed to complete assignment. Please try again.");
      setShowParkingModal(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Car size={48} className="text-orange-500 mx-auto" />
          </div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white relative flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-4 pt-6 pb-12 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <button className="bg-orange-700 hover:bg-orange-800 p-2 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>
        <p className="text-orange-100">Welcome back, Driver!</p>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8 flex-1 overflow-y-auto">
        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* New Assignments Card */}
        <button
          onClick={() => setShowAssignmentsModal(true)}
          className="w-full mt-6 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-4 mb-6 hover:shadow-lg transition-all text-left">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={24} className="text-orange-600" />
            <h3 className="text-lg font-bold text-orange-900">
              New Assignments
            </h3>
            {newAssignments.length > 0 && (
              <div className="ml-auto bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {newAssignments.length}
              </div>
            )}
          </div>
          <p className="text-sm text-orange-700">
            {newAssignments.length === 0
              ? "No new assignments"
              : `${newAssignments.length} new assignment${
                  newAssignments.length > 1 ? "s" : ""
                } available`}
          </p>
        </button>

        {/* Current Assignment */}
        {currentAssignment && currentAssignment.status !== "completed" && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              {currentAssignment.status === "pending"
                ? "Pending Assignment"
                : "Current Assignment"}
            </h3>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-orange-900 mb-1">
                    {currentAssignment.type === "park"
                      ? "Park Vehicle"
                      : "Retrieve Vehicle"}
                  </h4>
                  <p className="text-sm text-orange-700">
                    {currentAssignment.parkingSession?.site?.name}
                  </p>
                </div>
                <span className="text-3xl">
                  {currentAssignment.type === "park" ? "🅿️" : "🚗"}
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                    <p className="font-bold text-gray-800">
                      {currentAssignment.parkingSession?.vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentAssignment.parkingSession?.vehicle?.number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-bold text-gray-800 flex items-center gap-1">
                      <MapPin size={14} />
                      {currentAssignment.parkingSession?.site?.name}
                    </p>
                  </div>
                </div>

                {currentAssignment.parkingSession?.valet && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned Valet</p>
                    <p className="font-bold text-gray-800">
                      {currentAssignment.parkingSession.valet.name}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-1">Ticket ID</p>
                  <p className="font-mono font-bold text-lg text-orange-600">
                    {currentAssignment.parkingSession?.ticketId}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {currentAssignment.status === "pending" ? (
                  <button
                    onClick={() => handleAcceptAssignment(currentAssignment)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all">
                    Accept Assignment
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleStartParking}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                      {showParkingModal && parkingStep === "loading" && (
                        <div className="animate-spin">
                          <Car size={20} />
                        </div>
                      )}
                      {showParkingModal && parkingStep === "loading"
                        ? "Processing..."
                        : `${
                            currentAssignment.type === "park"
                              ? "Park"
                              : "Retrieve"
                          } Vehicle`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <h3 className="text-lg font-bold text-gray-800 mb-3">Performance</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-600 font-semibold mb-1">PARKINGS</p>
            <p className="text-2xl font-bold text-blue-900">
              {stats.totalParkings}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs text-green-600 font-semibold mb-1">
              RETRIEVALS
            </p>
            <p className="text-2xl font-bold text-green-900">
              {stats.totalRetrievals}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-xs text-yellow-600 font-semibold mb-1">
              CURRENTLY PARKED
            </p>
            <p className="text-2xl font-bold text-yellow-900">
              {stats.currentlyParked}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-xs text-orange-600 font-semibold mb-1">
              EARNINGS
            </p>
            <p className="text-2xl font-bold text-orange-900">
              ₹{stats.totalEarnings}
            </p>
          </div>
        </div>

        {/* All Assignments */}
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          All Assignments ({allAssignments.length})
        </h3>
        {allAssignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No assignments at the moment
          </p>
        ) : (
          <div className="space-y-3">
            {allAssignments.map(assignment => (
              <div
                key={assignment.id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  assignment.status === "completed"
                    ? "border-green-300 bg-green-50"
                    : assignment.status === "accepted"
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onClick={() => {
                  if (assignment.status === "pending") {
                    handleAcceptAssignment(assignment);
                  } else if (assignment.status === "accepted") {
                    setCurrentAssignment(assignment);
                  }
                }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {assignment.type === "park" ? "Park" : "Retrieve"} •{" "}
                      {assignment.parkingSession?.vehicle?.model}
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin size={12} />
                      {assignment.parkingSession?.site?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        assignment.status === "completed"
                          ? "bg-green-200 text-green-800"
                          : assignment.status === "accepted"
                          ? "bg-orange-200 text-orange-800"
                          : "bg-gray-200 text-gray-800"
                      }`}>
                      {assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(assignment.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignments Modal */}
      {showAssignmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                New Assignments
              </h3>
              <button
                onClick={() => setShowAssignmentsModal(false)}
                className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {newAssignments.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                No new assignments
              </p>
            ) : (
              <div className="space-y-3">
                {newAssignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="mb-3">
                      <h4 className="font-bold text-gray-800 mb-1">
                        {assignment.type === "park"
                          ? "Park Vehicle"
                          : "Retrieve Vehicle"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {assignment.parkingSession?.vehicle?.model} •{" "}
                        {assignment.parkingSession?.vehicle?.number}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-semibold text-gray-800">
                        {assignment.parkingSession?.site?.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Ticket: {assignment.parkingSession?.ticketId}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAcceptAssignment(assignment)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition-all">
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parking Progress Modal */}
      {showParkingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center">
            {parkingStep === "loading" && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-orange-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-500 animate-spin"></div>
                    <Car size={40} className="text-orange-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {currentAssignment?.type === "park"
                    ? "Parking Vehicle"
                    : "Retrieving Vehicle"}
                </h3>
                <p className="text-gray-600">Please wait...</p>
              </>
            )}
            {parkingStep === "success" && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle
                      size={48}
                      weight="fill"
                      className="text-green-600"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  Success!
                </h3>
                <p className="text-gray-600">
                  {currentAssignment?.type === "park"
                    ? "Vehicle parked successfully!"
                    : "Vehicle retrieved successfully!"}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
