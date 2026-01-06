"use client";

import { useState, useEffect } from "react";
import { PARKING_SITES } from "../lib/sites";
import { parkingAPI, testAPI } from "../lib/api";
import {
  QrCode,
  Ticket,
  Clock,
  Gear,
  House,
  Plus,
  X,
  CheckCircle,
  Car,
  MapPin,
  CalendarBlank,
  CaretLeft,
  CaretRight,
} from "phosphor-react";

interface ParkingSession {
  id: string;
  ticketid: string;
  userid: string;
  vehicleid: string;
  siteid: string;
  valetid?: string;
  status:
    | "parked"
    | "in-progress"
    | "retrieved"
    | "ongoing"
    | "completed"
    | "cancelled";
  entrytime: string;
  exittime?: string;
  parkinglevel?: string;
  amount?: number;
  amountcharged?: number;
  paymentmethod?: string;
  ispaid?: boolean;
  createdat: string;
  updatedat: string;
  site?: { name: string; location: string };
  vehicle?: { vehiclenumber: string; vehiclemodel: string };
  valet?: { id: string; name: string };
}

export default function UserHome() {
  const [userId, setUserId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("testUserId") || "user-1";
    }
    return "user-1";
  });

  const [activeTab, setActiveTab] = useState<
    "home" | "ticket" | "history" | "settings"
  >("home");
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedParkingIndex, setSelectedParkingIndex] = useState(0);

  // API Data
  const [currentActiveParkings, setCurrentActiveParkings] = useState<
    ParkingSession[]
  >([]);
  const [recentParkings, setRecentParkings] = useState<ParkingSession[]>([]);
  const [userVehicles, setUserVehicles] = useState<any[]>([]);
  const [parkingSites, setParkingSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isGettingCar, setIsGettingCar] = useState(false);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210",
  });
  const [showParkingModal, setShowParkingModal] = useState(false);
  const [parkingStep, setParkingStep] = useState<"loading" | "success">(
    "loading"
  );
  const [showRetrievalModal, setShowRetrievalModal] = useState(false);
  const [retrievalStep, setRetrievalStep] = useState<"loading" | "success">(
    "loading"
  );

  // Mock data for vehicles (in real app, fetch from API)
  // Now using real data from userVehicles state instead

  // Fetch parking sessions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🔍 Starting fetchData...");

        // First, try to get userId from localStorage
        let currentUserId = userId;
        console.log("📱 Current userId from state:", currentUserId);
        console.log(
          "💾 localStorage testUserId:",
          localStorage.getItem("testUserId")
        );

        // If no userId in localStorage, fetch a test user
        if (!currentUserId || currentUserId === "user-1") {
          console.log("⚠️ userId is invalid or default, fetching test user...");
          try {
            console.log("🌐 Calling testAPI.getTestUser()...");
            const userResponse = await testAPI.getTestUser();
            console.log("✅ Test user response:", userResponse.data);
            currentUserId = userResponse.data.id;
            console.log("🎯 Got userId:", currentUserId);
            setUserId(currentUserId);
            localStorage.setItem("testUserId", currentUserId);
            console.log("💾 Saved to localStorage");
          } catch (userErr: any) {
            console.error("❌ Failed to fetch test user:", userErr);
            console.error(
              "📋 Error details:",
              userErr.response?.data || userErr.message
            );
            setError("Failed to load user data");
            setLoading(false);
            return;
          }
        }

        // Now fetch sessions for this user
        console.log("🚗 Fetching sessions for userId:", currentUserId);
        const response = await parkingAPI.getUserSessions(currentUserId);
        console.log("✅ Sessions response:", response.data);
        const sessions = response.data;

        // Separate active and completed sessions
        const active = sessions.filter(
          (s: ParkingSession) => s.status !== "retrieved"
        );
        const completed = sessions.filter(
          (s: ParkingSession) => s.status === "retrieved"
        );

        console.log("📊 Active sessions:", active.length);
        console.log("📊 Completed sessions:", completed.length);

        setCurrentActiveParkings(active);
        setRecentParkings(completed);

        // Fetch user vehicles
        console.log("🚗 Fetching vehicles for userId:", currentUserId);
        try {
          const vehiclesResponse = await testAPI.getUserVehicles(currentUserId);
          console.log("✅ Vehicles response:", vehiclesResponse.data);
          setUserVehicles(vehiclesResponse.data || []);
        } catch (vehicleErr) {
          console.error("⚠️ Failed to fetch vehicles:", vehicleErr);
          setUserVehicles([]);
        }

        // Fetch parking sites from backend
        console.log("📍 Fetching sites...");
        try {
          const sitesResponse = await testAPI.getSites();
          console.log("✅ Sites response:", sitesResponse.data);
          setParkingSites(sitesResponse.data || []);
        } catch (sitesErr) {
          console.error("⚠️ Failed to fetch sites:", sitesErr);
          setParkingSites(PARKING_SITES); // Fallback to constant if API fails
        }

        setError(null);
      } catch (err: any) {
        console.error("❌ Failed to fetch sessions:", err);
        console.error("📋 Error response:", err.response?.data || err.message);
        setError("Failed to load parking data");
        setCurrentActiveParkings([]);
        setRecentParkings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleParkCar = async () => {
    if (selectedVehicle && selectedLocationId && paymentMethod) {
      setShowParkingModal(true);
      setParkingStep("loading");

      try {
        const response = await parkingAPI.createSession({
          userId: userId,
          vehicleId: selectedVehicle,
          siteId: selectedLocationId,
          status: "parked",
        });

        if (response.status === 201) {
          await new Promise(resolve => setTimeout(resolve, 2000));

          const sessionsResponse = await parkingAPI.getUserSessions(userId);
          const active = sessionsResponse.data.filter(
            (s: ParkingSession) => s.status !== "retrieved"
          );
          setCurrentActiveParkings(active);

          setParkingStep("success");

          setTimeout(() => {
            setShowParkingModal(false);
            setShowScanModal(false);
            setSelectedVehicle("");
            setSelectedLocation("");
            setSelectedLocationId("");
            setPaymentMethod("");
          }, 1500);
        }
      } catch (err: any) {
        console.error("Failed to create parking session:", err);
        alert("Failed to park car. Please try again.");
        setShowParkingModal(false);
      }
    }
  };

  const handleGetCar = async () => {
    if (currentActiveParkings.length === 0) {
      alert("No active parking to retrieve");
      return;
    }

    const parkingToRetrieve = currentActiveParkings[selectedParkingIndex];
    setShowRetrievalModal(true);
    setRetrievalStep("loading");

    try {
      const response = await parkingAPI.updateSession(parkingToRetrieve.id, {
        status: "retrieved",
      });

      if (response.status === 200) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const sessionsResponse = await parkingAPI.getUserSessions(userId);
        const active = sessionsResponse.data.filter(
          (s: ParkingSession) => s.status !== "retrieved"
        );
        const completed = sessionsResponse.data.filter(
          (s: ParkingSession) => s.status === "retrieved"
        );

        setCurrentActiveParkings(active);
        setRecentParkings(completed);

        setRetrievalStep("success");

        setTimeout(() => {
          setShowRetrievalModal(false);
          setIsGettingCar(false);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Failed to retrieve car:", err);
      alert("Failed to retrieve car. Please try again.");
      setShowRetrievalModal(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Car size={48} className="text-primary mx-auto" />
          </div>
          <p className="text-gray-600">Loading parking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white relative flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-blue-600 text-white px-4 pt-6 pb-12 rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-1">Smart Parking</h1>
        <p className="text-blue-100">Welcome back!</p>

        <div className="mt-6 bg-white bg-opacity-20 backdrop-blur rounded-2xl p-4 border border-white border-opacity-30">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={20} weight="fill" className="text-yellow-300" />
            <span className="text-xs font-semibold">BEST IN INDIA</span>
          </div>
          <h2 className="text-lg font-bold mb-1">Premium Parking Solution</h2>
          <p className="text-sm text-blue-100">
            Trusted by 1M+ users nationwide
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-32 flex-1 overflow-y-auto">
        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        )}

        {activeTab === "home" && (
          <>
            {/* Scan to Park Button */}
            <button
              onClick={() => setShowScanModal(true)}
              className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-4 rounded-2xl flex items-center gap-4 transition-all">
              <div className="bg-white bg-opacity-80 p-3 rounded-xl">
                <QrCode size={24} weight="fill" className="text-yellow-600" />
              </div>
              <div className="text-left">
                <div className="font-bold">Scan to Park</div>
                <div className="text-sm opacity-80">
                  Scan QR code at parking entrance
                </div>
              </div>
              <span className="ml-auto text-xl">›</span>
            </button>

            {/* Active Parking Section */}
            {currentActiveParkings.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-gray-800 mt-8 mb-3">
                  Active Parking
                </h3>
                <div className="space-y-3 mb-6">
                  {currentActiveParkings.map((parking, index) => (
                    <div
                      key={parking.id}
                      onClick={() => {
                        setSelectedParkingIndex(index);
                        setActiveTab("ticket");
                      }}
                      className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-2xl mb-1">
                            <QrCode
                              size={24}
                              weight="fill"
                              className="text-green-600"
                            />
                          </div>
                          <h4 className="font-bold text-gray-800">
                            {parking.site?.name}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={12} /> {parking.site?.location}
                          </p>
                        </div>
                        <span className="text-xl">›</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {new Date(parking.entrytime).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car size={16} /> {parking.vehicle?.vehiclenumber}
                        </span>
                      </div>
                      <div className="inline-block bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full">
                        ●{" "}
                        {parking.status.charAt(0).toUpperCase() +
                          parking.status.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Recent Parkings Section */}
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Recent Parking
            </h3>
            {recentParkings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No parking history yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentParkings.map(parking => (
                  <div
                    key={parking.id}
                    className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-2xl mb-1">
                          <QrCode
                            size={24}
                            weight="fill"
                            className="text-blue-600"
                          />
                        </div>
                        <h4 className="font-bold text-gray-800">
                          {parking.site?.name}
                        </h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={12} /> {parking.site?.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ₹150
                        </div>
                        <div className="text-xs font-semibold text-green-600">
                          Completed
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <CalendarBlank size={14} />
                        {new Date(parking.createdat).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car size={14} /> {parking.vehicle?.vehiclenumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "ticket" && (
          <div className="mt-6">
            {currentActiveParkings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">
                  <QrCode size={64} className="text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No Active Parking
                </h3>
                <p className="text-gray-600 mb-6">
                  You don't have any active parking at the moment.
                </p>
                <button
                  onClick={() => setActiveTab("home")}
                  className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                  Scan to Park
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-b from-primary to-blue-600 text-white rounded-2xl p-6 text-center mb-6">
                {currentActiveParkings.length > 1 && (
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() =>
                        setSelectedParkingIndex(
                          selectedParkingIndex === 0
                            ? currentActiveParkings.length - 1
                            : selectedParkingIndex - 1
                        )
                      }
                      className="p-2 hover:bg-blue-500 rounded-lg transition-all">
                      <CaretLeft size={24} />
                    </button>
                    <div className="text-sm font-semibold">
                      {selectedParkingIndex + 1} of{" "}
                      {currentActiveParkings.length}
                    </div>
                    <button
                      onClick={() =>
                        setSelectedParkingIndex(
                          selectedParkingIndex ===
                            currentActiveParkings.length - 1
                            ? 0
                            : selectedParkingIndex + 1
                        )
                      }
                      className="p-2 hover:bg-blue-500 rounded-lg transition-all">
                      <CaretRight size={24} />
                    </button>
                  </div>
                )}

                <h2 className="text-xl font-bold mb-2">
                  {currentActiveParkings[selectedParkingIndex]?.site?.name}
                </h2>
                <p className="text-blue-100 mb-4">
                  {currentActiveParkings[selectedParkingIndex]?.site?.location}
                </p>

                <div className="bg-white text-gray-800 rounded-xl p-6 mb-4">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">TICKET ID</p>
                    <p className="text-2xl font-bold text-primary">
                      {currentActiveParkings[selectedParkingIndex]?.ticketid}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left mb-4 border-t border-gray-200 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="font-bold">
                        {
                          currentActiveParkings[selectedParkingIndex]?.vehicle
                            ?.vehiclenumber
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Entry Time</p>
                      <p className="font-bold">
                        {new Date(
                          currentActiveParkings[selectedParkingIndex]?.entrytime
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-700">
                        {new Date(
                          currentActiveParkings[selectedParkingIndex]?.entrytime
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-2xl font-bold text-primary mb-2">₹150</p>
                    <p className="text-xs text-gray-500 mb-4">Amount Paid</p>

                    <div className="bg-gray-200 w-24 h-24 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <QrCode
                        size={48}
                        weight="fill"
                        className="text-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Powered by Smart Parking
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGetCar}
                  disabled={showRetrievalModal}
                  className={`w-full text-white font-bold py-3 rounded-lg mb-2 transition-all flex items-center justify-center gap-2 ${
                    showRetrievalModal
                      ? "bg-green-600 cursor-wait"
                      : "bg-green-500 hover:bg-green-600"
                  }`}>
                  {showRetrievalModal && (
                    <div className="animate-spin">
                      <Car size={20} />
                    </div>
                  )}
                  {showRetrievalModal ? "Getting your car..." : "Get my car"}
                </button>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg mb-2 transition-all">
                  Download Invoice
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all">
                  Share Ticket
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Parking History
            </h3>
            {recentParkings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No parking history yet
              </p>
            ) : (
              recentParkings.map(parking => (
                <div
                  key={parking.id}
                  className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">
                          <QrCode
                            size={24}
                            weight="fill"
                            className="text-blue-600"
                          />
                        </span>
                        <h4 className="font-bold text-gray-800">
                          {parking.site?.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} /> {parking.site?.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ₹150
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Car size={14} /> {parking.vehicle?.vehiclenumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarBlank size={14} />
                      {new Date(parking.createdat).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="inline-block bg-green-100 text-green-700 text-xs font-bold py-1 px-3 rounded-full">
                    Completed
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Settings</h3>

            {/* Profile Section */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <h4 className="font-bold text-gray-800 mb-3">Profile</h4>
              <button
                onClick={() =>
                  setEditingProfile(editingProfile === "name" ? null : "name")
                }
                className="w-full text-left px-4 py-3 bg-gray-100 rounded-lg mb-2 hover:bg-gray-200 transition-all">
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-semibold text-gray-800">
                  {profileData.name}
                </p>
              </button>
              <button
                onClick={() =>
                  setEditingProfile(editingProfile === "email" ? null : "email")
                }
                className="w-full text-left px-4 py-3 bg-gray-100 rounded-lg mb-2 hover:bg-gray-200 transition-all">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-800">
                  {profileData.email}
                </p>
              </button>
              <button
                onClick={() =>
                  setEditingProfile(editingProfile === "phone" ? null : "phone")
                }
                className="w-full text-left px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold text-gray-800">
                  {profileData.phone}
                </p>
              </button>
            </div>

            {/* Security Section */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <h4 className="font-bold text-gray-800 mb-3">Security</h4>
              <button
                onClick={() =>
                  alert(
                    "Password change initiated! Please check your email for password reset link."
                  )
                }
                className="w-full text-left px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all">
                Change Password
              </button>
            </div>

            {/* Vehicles Section */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <h4 className="font-bold text-gray-800 mb-3">Vehicles</h4>
              {userVehicles && userVehicles.length > 0 ? (
                userVehicles.map((vehicle: any) => (
                  <button
                    key={vehicle.id}
                    onClick={() =>
                      alert(
                        `Editing ${vehicle.vehiclemodel} - ${vehicle.vehiclenumber}`
                      )
                    }
                    className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg mb-2 hover:bg-gray-200 transition-all">
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">
                        {vehicle.vehiclemodel}
                      </p>
                      <p className="text-xs text-gray-500">
                        {vehicle.vehiclenumber}
                      </p>
                    </div>
                    <span className="text-lg">✎</span>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No vehicles</p>
              )}
              <button
                onClick={() => alert("Adding new vehicle... Form opened.")}
                className="w-full mt-2 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold flex items-center justify-center gap-2">
                <Plus size={18} /> Add Vehicle
              </button>
            </div>

            {/* Payment Methods Section */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <h4 className="font-bold text-gray-800 mb-3">Payment Methods</h4>
              <button
                onClick={() => alert("Editing UPI payment method...")}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg mb-2 hover:bg-gray-200 transition-all text-left">
                <p className="font-semibold text-gray-800">
                  UPI - 9876543210@okhdfcbank
                </p>
              </button>
              <button
                onClick={() =>
                  alert("Adding new payment method... Form opened.")
                }
                className="w-full mt-2 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold flex items-center justify-center gap-2">
                <Plus size={18} /> Add Payment Method
              </button>
            </div>

            {/* Transaction History Section */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <h4 className="font-bold text-gray-800 mb-3">
                Transaction History
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between px-4 py-2 bg-gray-100 rounded-lg">
                  <span className="text-gray-800">Inorbit Mall • Jan 6</span>
                  <span className="font-bold text-red-600">-₹150</span>
                </div>
                <div className="flex justify-between px-4 py-2 bg-gray-100 rounded-lg">
                  <span className="text-gray-800">
                    Phoenix Courtyard • Jan 2
                  </span>
                  <span className="font-bold text-red-600">-₹180</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Select Vehicle
            </h3>

            <div className="space-y-3 mb-6">
              {userVehicles && userVehicles.length > 0 ? (
                userVehicles
                  .filter(
                    vehicle =>
                      !currentActiveParkings.some(
                        p => p.vehicle?.vehiclenumber === vehicle.vehiclenumber
                      )
                  )
                  .map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedVehicle === vehicle.id
                          ? "border-primary bg-blue-50"
                          : "border-gray-200 hover:border-primary"
                      }`}>
                      <p className="font-bold text-gray-800">
                        {vehicle.vehiclemodel}
                      </p>
                      <p className="text-sm text-gray-600">
                        {vehicle.vehiclenumber}
                      </p>
                    </button>
                  ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No vehicles available
                </p>
              )}
            </div>

            {selectedVehicle && (
              <>
                <h4 className="text-lg font-bold text-gray-800 mb-3">
                  Select Parking Location
                </h4>
                <div className="space-y-3 mb-6">
                  {parkingSites && parkingSites.length > 0 ? (
                    parkingSites.map(site => (
                      <button
                        key={site.id}
                        onClick={() => {
                          setSelectedLocation(`${site.name}, ${site.location}`);
                          setSelectedLocationId(site.id);
                        }}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 ${
                          selectedLocationId === site.id
                            ? "border-primary bg-blue-50"
                            : "border-gray-200 hover:border-primary"
                        }`}>
                        <MapPin size={16} />
                        {site.name}, {site.location}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No sites available
                    </p>
                  )}
                </div>
              </>
            )}

            {selectedVehicle && selectedLocationId && (
              <>
                <h4 className="text-lg font-bold text-gray-800 mb-3">
                  Select Payment Method
                </h4>
                <div className="space-y-3 mb-6">
                  {["UPI", "Netbanking", "Cash", "Card"].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`w-full p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === method
                          ? "border-primary bg-blue-50"
                          : "border-gray-200 hover:border-primary"
                      }`}>
                      {method}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleParkCar}
                  disabled={
                    !selectedVehicle || !selectedLocationId || !paymentMethod
                  }
                  className="w-full bg-primary hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-all mb-2">
                  Park my car
                </button>
              </>
            )}

            <button
              onClick={() => {
                setShowScanModal(false);
                setSelectedVehicle("");
                setPaymentMethod("");
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all">
              Cancel
            </button>
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
                    <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
                    <Car size={40} className="text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Processing Parking
                </h3>
                <p className="text-gray-600">
                  Please wait while we confirm your parking...
                </p>
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
                  Parking Confirmed!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your car is parked successfully.
                </p>
                <p className="text-sm text-gray-500">
                  Location: {selectedLocation}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Retrieval Progress Modal */}
      {showRetrievalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center">
            {retrievalStep === "loading" && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-green-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 border-r-green-600 animate-spin"></div>
                    <Car size={40} className="text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Retrieving Your Car
                </h3>
                <p className="text-gray-600">
                  Our driver is bringing your car to the exit...
                </p>
              </>
            )}
            {retrievalStep === "success" && (
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
                  Car Ready!
                </h3>
                <p className="text-gray-600">
                  Your car is waiting at the exit. Thank you for using Smart
                  Parking!
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around gap-2 rounded-b-3xl">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
            activeTab === "home"
              ? "text-primary"
              : "text-gray-600 hover:text-gray-800"
          }`}>
          <House size={24} weight={activeTab === "home" ? "fill" : "regular"} />
          <span className="text-xs font-semibold">Home</span>
        </button>
        <button
          onClick={() => setActiveTab("ticket")}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
            activeTab === "ticket"
              ? "text-primary"
              : "text-gray-600 hover:text-gray-800"
          }`}>
          <Ticket
            size={24}
            weight={activeTab === "ticket" ? "fill" : "regular"}
          />
          <span className="text-xs font-semibold">Ticket</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
            activeTab === "history"
              ? "text-primary"
              : "text-gray-600 hover:text-gray-800"
          }`}>
          <Clock
            size={24}
            weight={activeTab === "history" ? "fill" : "regular"}
          />
          <span className="text-xs font-semibold">History</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
            activeTab === "settings"
              ? "text-primary"
              : "text-gray-600 hover:text-gray-800"
          }`}>
          <Gear
            size={24}
            weight={activeTab === "settings" ? "fill" : "regular"}
          />
          <span className="text-xs font-semibold">Settings</span>
        </button>
      </div>
    </div>
  );
}
