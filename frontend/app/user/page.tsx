"use client";

import { useState } from "react";
import { PARKING_SITES } from "../lib/sites";
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

export default function UserHome() {
  const [activeTab, setActiveTab] = useState<
    "home" | "ticket" | "history" | "settings"
  >("home");
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedParkingIndex, setSelectedParkingIndex] = useState(0);
  const [currentActiveParkings, setCurrentActiveParkings] = useState([
    {
      id: 1,
      location: "Inorbit Mall",
      vehicle: "MH 12 AB 1234",
      entryTime: "01:08 pm",
      duration: "14m",
      status: "Parked",
    },
  ]);
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
  const [recentParkings, setRecentParkings] = useState([
    {
      id: 1,
      location: "Phoenix Mall",
      address: "Lower Parel, Mumbai",
      vehicle: "MH 12 AB 1234",
      date: "8 Dec 2025",
      time: "4h 15m",
      amount: "₹180",
      status: "Completed",
    },
    {
      id: 2,
      location: "Central Plaza",
      address: "Andheri West, Mumbai",
      vehicle: "MH 12 AB 1234",
      date: "6 Dec 2025",
      time: "2h 30m",
      amount: "₹120",
      status: "Completed",
    },
  ]);

  // Mock data
  const mockVehicles = [
    { id: 1, number: "MH 12 AB 1234", model: "Toyota Camry" },
    { id: 2, number: "MH 12 AB 5678", model: "Honda City" },
  ];

  const mockLocations = PARKING_SITES.map(
    site => `${site.name}, ${site.location}`
  );

  const handleParkCar = async () => {
    if (selectedVehicle && selectedLocation && paymentMethod) {
      setShowParkingModal(true);
      setParkingStep("loading");

      // Simulate parking process
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Add to active parkings
      const newParking = {
        id: currentActiveParkings.length + 1,
        location: selectedLocation.split(",")[0],
        vehicle: selectedVehicle,
        entryTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: "1m",
        status: "Parked",
      };
      setCurrentActiveParkings([...currentActiveParkings, newParking]);
      setParkingStep("success");

      // Auto close after 1.5 seconds on success
      setTimeout(() => {
        setShowParkingModal(false);
        setShowScanModal(false);
        setSelectedVehicle("");
        setSelectedLocation("");
        setPaymentMethod("");
      }, 1500);
    }
  };

  const handleGetCar = async () => {
    setShowRetrievalModal(true);
    setRetrievalStep("loading");

    // Simulate retrieval process
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Get the parking being retrieved using selectedParkingIndex
    const parkingToMove = currentActiveParkings[selectedParkingIndex];

    if (parkingToMove) {
      // Calculate random duration for the parking
      const durationMinutes = Math.floor(Math.random() * 240) + 15; // 15 to 255 minutes
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const durationString =
        hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Calculate amount (₹30 per hour)
      const amount = Math.ceil((durationMinutes / 60) * 30);

      // Get current date and time
      const now = new Date();
      const dateString = now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      // Add to recent parkings
      const completedParking = {
        id: recentParkings.length + 1,
        location: parkingToMove.location,
        address: `${parkingToMove.location}, Mumbai`,
        vehicle: parkingToMove.vehicle,
        date: dateString,
        time: durationString,
        amount: `₹${amount}`,
        status: "Completed",
      };

      setRecentParkings([completedParking, ...recentParkings]);

      // Remove the specific car from active parkings
      const updatedParkings = currentActiveParkings.filter(
        p => p.vehicle !== parkingToMove.vehicle
      );
      setCurrentActiveParkings(updatedParkings);

      // Reset selected index if needed
      if (selectedParkingIndex >= updatedParkings.length) {
        setSelectedParkingIndex(Math.max(0, updatedParkings.length - 1));
      }
    }

    setRetrievalStep("success");

    // Auto close after 1.5 seconds on success
    setTimeout(() => {
      setShowRetrievalModal(false);
      setIsGettingCar(false);
    }, 1500);
  };

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
                  {currentActiveParkings.map(parking => (
                    <div
                      key={parking.id}
                      className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-2xl p-4">
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
                            {parking.location}
                          </h4>
                        </div>
                        <span className="text-xl">›</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock size={16} /> {parking.entryTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car size={16} /> {parking.vehicle}
                        </span>
                      </div>
                      <div className="inline-block bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full">
                        ● {parking.status} • {parking.duration}
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
                        {parking.location}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} /> {parking.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {parking.amount}
                      </div>
                      <div className="text-xs font-semibold text-green-600">
                        {parking.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <CalendarBlank size={14} /> {parking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Car size={14} /> {parking.vehicle}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {parking.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
                {/* Navigation Arrows for Multiple Parkings */}
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
                  {currentActiveParkings[selectedParkingIndex].location}
                </h2>
                <p className="text-blue-100 mb-4">
                  {currentActiveParkings[selectedParkingIndex].location}, Mumbai
                </p>

                <div className="bg-white text-gray-800 rounded-xl p-6 mb-4">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">TICKET ID</p>
                    <p className="text-2xl font-bold text-primary">
                      TK-2026-01-
                      {String(
                        currentActiveParkings[selectedParkingIndex].id
                      ).padStart(2, "0")}
                      -{Math.floor(Math.random() * 900) + 100}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left mb-4 border-t border-gray-200 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="font-bold">
                        {currentActiveParkings[selectedParkingIndex].vehicle}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Entry Time</p>
                      <p className="font-bold">
                        {new Date().toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-700">
                        {currentActiveParkings[selectedParkingIndex].entryTime}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Duration:{" "}
                      {currentActiveParkings[selectedParkingIndex].duration}
                    </p>
                    <p className="text-2xl font-bold text-primary mb-2">₹150</p>
                    <p className="text-xs text-gray-500 mb-4">Amount Paid</p>

                    {/* Fake QR Code */}
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
            {recentParkings.map(parking => (
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
                        {parking.location}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} /> {parking.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {parking.amount}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Car size={14} /> {parking.vehicle}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarBlank size={14} /> {parking.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {parking.time}
                  </span>
                </div>
                <div className="inline-block bg-green-100 text-green-700 text-xs font-bold py-1 px-3 rounded-full">
                  {parking.status}
                </div>
              </div>
            ))}
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
              {mockVehicles.map(vehicle => (
                <button
                  key={vehicle.id}
                  onClick={() =>
                    alert(`Editing ${vehicle.model} - ${vehicle.number}`)
                  }
                  className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg mb-2 hover:bg-gray-200 transition-all">
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">
                      {vehicle.model}
                    </p>
                    <p className="text-xs text-gray-500">{vehicle.number}</p>
                  </div>
                  <span className="text-lg">✎</span>
                </button>
              ))}
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
                  <span className="text-gray-800">Phoenix Mall • Dec 8</span>
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
              {mockVehicles
                .filter(
                  vehicle =>
                    !currentActiveParkings.some(
                      p => p.vehicle === vehicle.number
                    )
                )
                .map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.number)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedVehicle === vehicle.number
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 hover:border-primary"
                    }`}>
                    <p className="font-bold text-gray-800">{vehicle.model}</p>
                    <p className="text-sm text-gray-600">{vehicle.number}</p>
                  </button>
                ))}
            </div>

            {selectedVehicle && (
              <>
                <h4 className="text-lg font-bold text-gray-800 mb-3">
                  Select Parking Location
                </h4>
                <div className="space-y-3 mb-6">
                  {mockLocations.map(location => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(location)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 ${
                        selectedLocation === location
                          ? "border-primary bg-blue-50"
                          : "border-gray-200 hover:border-primary"
                      }`}>
                      <MapPin size={16} />
                      {location}
                    </button>
                  ))}
                </div>
              </>
            )}

            {selectedVehicle && selectedLocation && (
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
                    !selectedVehicle || !selectedLocation || !paymentMethod
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
