"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Car, MapPin, Clock, CheckCircle, X } from "phosphor-react";

interface Assignment {
  id: number;
  vehicle: string;
  numberPlate: string;
  customer: string;
  location: string;
  address: string;
  parkLevel?: string;
  assignedAt: string;
  type: "park" | "retrieve";
  status: "pending" | "accepted" | "completed";
}

export default function DriverPage() {
  const router = useRouter();
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showParkingModal, setShowParkingModal] = useState(false);
  const [parkingStep, setParkingStep] = useState<"loading" | "success">(
    "loading"
  );
  const [currentAssignment, setCurrentAssignment] = useState<Assignment>({
    id: 1,
    vehicle: "Honda City",
    numberPlate: "MH 02 AB 1234",
    customer: "Amit Sharma",
    location: "Phoenix Courtyard",
    address: "Necklace Road, Hyderabad",
    parkLevel: "Level 2 - B34",
    assignedAt: "01:18 pm",
    type: "park",
    status: "accepted",
  });
  const [stats, setStats] = useState({
    parkings: 5,
    retrieved: 8,
    parked: 4,
    earned: 1200,
  });
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([
    {
      id: 2,
      vehicle: "Hyundai Creta",
      numberPlate: "MH 02 AB 5678",
      customer: "Priya Patel",
      location: "Inorbit Mall",
      address: "Kukatpally, Hyderabad",
      parkLevel: "Level 3 - C12",
      assignedAt: "01:25 pm",
      type: "park",
      status: "pending",
    },
    {
      id: 3,
      vehicle: "Toyota Fortuner",
      numberPlate: "MH 02 AB 9012",
      customer: "Rajesh Kumar",
      location: "Prestige Tech Park",
      address: "HITEC City, Hyderabad",
      parkLevel: "Level 1 - A45",
      assignedAt: "01:32 pm",
      type: "park",
      status: "pending",
    },
    {
      id: 4,
      vehicle: "Maruti Swift",
      numberPlate: "MH 02 AB 3456",
      customer: "Sneha Gupta",
      location: "Forum Bengaluru",
      address: "Koramangala, Bangalore",
      parkLevel: "Level 2 - B78",
      assignedAt: "01:45 pm",
      type: "park",
      status: "pending",
    },
    {
      id: 5,
      vehicle: "Honda City",
      numberPlate: "MH 02 AB 1111",
      customer: "John Doe",
      location: "Phoenix Courtyard",
      address: "Necklace Road, Hyderabad",
      assignedAt: "01:52 pm",
      type: "retrieve",
      status: "pending",
    },
    {
      id: 6,
      vehicle: "Mahindra XUV",
      numberPlate: "MH 02 AB 2222",
      customer: "Sarah Wilson",
      location: "Inorbit Mall",
      address: "Kukatpally, Hyderabad",
      assignedAt: "02:10 pm",
      type: "retrieve",
      status: "pending",
    },
    {
      id: 7,
      vehicle: "Tata Nexon",
      numberPlate: "MH 02 AB 3333",
      customer: "Mike Johnson",
      location: "Central Plaza",
      address: "Andheri West, Mumbai",
      assignedAt: "02:15 pm",
      type: "retrieve",
      status: "pending",
    },
  ]);

  const newAssignments = allAssignments.filter(a => a.status === "pending");
  const acceptedAssignments = allAssignments.filter(
    a => a.status === "accepted"
  );

  const handleAcceptAssignment = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
    setAllAssignments(
      allAssignments.map(a =>
        a.id === assignment.id ? { ...a, status: "accepted" } : a
      )
    );
    setShowAssignmentsModal(false);
  };

  const handleStartParking = async () => {
    setShowParkingModal(true);
    setParkingStep("loading");

    // Simulate parking process
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Update stats based on assignment type
    setStats(prev => ({
      ...prev,
      parkings: prev.parkings + 1,
      parked: currentAssignment.type === "park" ? prev.parked + 1 : prev.parked,
      retrieved:
        currentAssignment.type === "retrieve"
          ? prev.retrieved + 1
          : prev.retrieved,
      earned: prev.earned + 150,
    }));

    // Mark current assignment as completed
    setAllAssignments(
      allAssignments.map(a =>
        a.id === currentAssignment.id ? { ...a, status: "completed" } : a
      )
    );

    setParkingStep("success");

    // Auto close and move to next assignment after 1.5 seconds on success
    setTimeout(() => {
      setShowParkingModal(false);

      // Find next pending assignment, or pick first accepted one
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
      }
    }, 1500);
  };

  return (
    <div className="h-full bg-white relative flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-4 pt-6 pb-12 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-700 hover:bg-orange-800 p-2 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>
        <p className="text-orange-100">Welcome back, Driver!</p>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8 flex-1 overflow-y-auto">
        {/* New Assignments Card */}
        <button
          onClick={() => setShowAssignmentsModal(true)}
          className="w-full mt-6 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-4 mb-6 hover:shadow-lg transition-all text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell size={28} className="text-orange-600" />
                {newAssignments.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {newAssignments.length}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">New Assignments</h3>
                <p className="text-sm text-gray-600">
                  {newAssignments.length} waiting for you
                </p>
              </div>
            </div>
            <span className="text-xl text-orange-600">›</span>
          </div>
        </button>

        {/* Current Assignment Card */}
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          Current Assignment
        </h3>
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 rounded-2xl p-4 mb-6">
          <div className="space-y-3">
            {/* Vehicle Info */}
            <div>
              <p className="text-xs text-gray-600 font-semibold">VEHICLE</p>
              <div className="flex items-center gap-2">
                <div className="text-2xl">
                  <Car size={24} className="text-orange-600" weight="fill" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {currentAssignment.vehicle}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentAssignment.numberPlate}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t border-orange-200 pt-3">
              <p className="text-xs text-gray-600 font-semibold">CUSTOMER</p>
              <p className="font-semibold text-gray-800">
                {currentAssignment.customer}
              </p>
            </div>

            {/* Location Info */}
            <div className="border-t border-orange-200 pt-3">
              <p className="text-xs text-gray-600 font-semibold">LOCATION</p>
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                <MapPin size={16} /> {currentAssignment.location}
              </p>
              <p className="text-sm text-gray-600">
                {currentAssignment.address}
              </p>
            </div>

            {/* Park Level - Only for parking assignments */}
            {currentAssignment.type === "park" && (
              <div className="border-t border-orange-200 pt-3">
                <p className="text-xs text-gray-600 font-semibold">PARK AT</p>
                <p className="font-semibold text-gray-800">
                  {currentAssignment.parkLevel}
                </p>
              </div>
            )}

            {/* Assignment Type Badge */}
            <div className="border-t border-orange-200 pt-3">
              <div
                className={`inline-flex text-white text-xs font-bold py-1 px-3 rounded-full items-center gap-1 ${
                  currentAssignment.type === "park"
                    ? "bg-blue-500"
                    : "bg-purple-500"
                }`}>
                {currentAssignment.type === "park"
                  ? "Park Vehicle"
                  : "Retrieve Vehicle"}
              </div>
            </div>

            {/* Assigned Time */}
            <div className="border-t border-orange-200 pt-3">
              <p className="text-xs text-gray-600 font-semibold">ASSIGNED AT</p>
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                <Clock size={16} /> {currentAssignment.assignedAt}
              </p>
            </div>

            {/* Status Badge */}
            <div className="border-t border-orange-200 pt-3">
              <div className="inline-flex bg-orange-500 text-white text-xs font-bold py-1 px-3 rounded-full items-center gap-1">
                ● {showParkingModal ? "Parking in Progress" : "Ready to Park"}
              </div>
            </div>

            {/* Start Parking Button */}
            <button
              onClick={handleStartParking}
              disabled={showParkingModal}
              className={`w-full mt-4 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                showParkingModal
                  ? "bg-green-600 cursor-wait"
                  : "bg-green-500 hover:bg-green-600"
              }`}>
              {showParkingModal && (
                <div className="animate-spin">
                  <Car size={20} />
                </div>
              )}
              {showParkingModal
                ? currentAssignment.type === "retrieve"
                  ? "Retrieving Car..."
                  : "Starting Parking..."
                : currentAssignment.type === "retrieve"
                ? "Retrieve Car"
                : "Start Parking"}
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-600 mb-3">TODAY</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats.parkings}
              </p>
              <p className="text-xs text-gray-600">Parkings</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.retrieved}
              </p>
              <p className="text-xs text-gray-600">Retrieved</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {stats.parked}
              </p>
              <p className="text-xs text-gray-600">Parked</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                ₹{stats.earned}
              </p>
              <p className="text-xs text-gray-600">Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parking Progress Modal */}
      {showParkingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center">
            {parkingStep === "loading" && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-orange-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-600 border-r-orange-600 animate-spin"></div>
                    <Car size={40} className="text-orange-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Starting Parking
                </h3>
                <p className="text-gray-600">
                  Please wait while we initiate the parking process...
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
                  Parking Started!
                </h3>
                <p className="text-gray-600">
                  Vehicle is now in parking mode. Continue with the next
                  assignment.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* New Assignments Modal */}
      {showAssignmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Available Assignments ({newAssignments.length})
              </h3>
              <button
                onClick={() => setShowAssignmentsModal(false)}
                className="hover:bg-gray-100 p-2 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {newAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-semibold mb-2">No Available Assignments</p>
                  <p className="text-sm">All assignments have been accepted!</p>
                </div>
              ) : (
                newAssignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-4">
                    {/* Vehicle Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-2xl">
                        <Car
                          size={24}
                          className="text-orange-600"
                          weight="fill"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">
                          {assignment.vehicle}
                        </p>
                        <p className="text-sm text-gray-600">
                          {assignment.numberPlate}
                        </p>
                      </div>
                      <div
                        className={`text-xs font-bold py-1 px-2 rounded-full ${
                          assignment.type === "park"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                        {assignment.type === "park" ? "Park" : "Retrieve"}
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="border-t border-orange-200 pt-2 mb-2">
                      <p className="text-xs text-gray-600 font-semibold">
                        CUSTOMER
                      </p>
                      <p className="font-semibold text-gray-800">
                        {assignment.customer}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="border-t border-orange-200 pt-2 mb-3">
                      <p className="text-xs text-gray-600 font-semibold">
                        LOCATION
                      </p>
                      <p className="font-semibold text-gray-800 flex items-center gap-1">
                        <MapPin size={14} /> {assignment.location}
                      </p>
                      <p className="text-xs text-gray-600">
                        {assignment.address}
                      </p>
                    </div>

                    {/* Accept Button */}
                    <button
                      onClick={() => handleAcceptAssignment(assignment)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-all">
                      Accept Assignment
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
