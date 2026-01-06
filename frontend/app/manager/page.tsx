"use client";

import { useState } from "react";
import { Phone, ArrowClockwise } from "phosphor-react";

interface Valet {
  id: string;
  name: string;
  phone: string;
}

interface ParkingSession {
  id: string;
  ticketId: string;
  carMake: string;
  carModel: string;
  plateNumber: string;
  status: "parked" | "in-progress" | "retrieved";
  customerName: string;
  valetId: string;
  valetName: string;
  valetPhone: string;
  location: string;
  entryTime: string;
  duration: string;
  payment: number;
  isPaid: boolean;
}

const VALET_LIST: Valet[] = [
  { id: "V001", name: "John Smith", phone: "+1-555-0101" },
  { id: "V002", name: "Maria Garcia", phone: "+1-555-0102" },
  { id: "V003", name: "David Chen", phone: "+1-555-0103" },
  { id: "V004", name: "Sarah Johnson", phone: "+1-555-0104" },
];

const INITIAL_PARKING_DATA: ParkingSession[] = [
  {
    id: "p1",
    ticketId: "TKT-2024-001",
    carMake: "Toyota",
    carModel: "Camry",
    plateNumber: "ABC-1234",
    status: "parked",
    customerName: "James Wilson",
    valetId: "V001",
    valetName: "John Smith",
    valetPhone: "+1-555-0101",
    location: "Level 2, Row C",
    entryTime: "10:30 AM",
    duration: "2h 15min",
    payment: 45.0,
    isPaid: true,
  },
  {
    id: "p2",
    ticketId: "TKT-2024-002",
    carMake: "Honda",
    carModel: "Accord",
    plateNumber: "XYZ-5678",
    status: "in-progress",
    customerName: "Emily Davis",
    valetId: "V002",
    valetName: "Maria Garcia",
    valetPhone: "+1-555-0102",
    location: "Level 1, Row A",
    entryTime: "11:45 AM",
    duration: "1h 30min",
    payment: 35.0,
    isPaid: false,
  },
  {
    id: "p3",
    ticketId: "TKT-2024-003",
    carMake: "BMW",
    carModel: "X5",
    plateNumber: "LUX-9999",
    status: "retrieved",
    customerName: "Michael Brown",
    valetId: "V003",
    valetName: "David Chen",
    valetPhone: "+1-555-0103",
    location: "Level 3, Row E",
    entryTime: "08:00 AM",
    duration: "4h 20min",
    payment: 85.0,
    isPaid: true,
  },
  {
    id: "p4",
    ticketId: "TKT-2024-004",
    carMake: "Tesla",
    carModel: "Model 3",
    plateNumber: "EV-2024",
    status: "parked",
    customerName: "Sarah Connor",
    valetId: "V001",
    valetName: "John Smith",
    valetPhone: "+1-555-0101",
    location: "Level 1, Row B",
    entryTime: "09:15 AM",
    duration: "3h 45min",
    payment: 65.0,
    isPaid: true,
  },
  {
    id: "p5",
    ticketId: "TKT-2024-005",
    carMake: "Audi",
    carModel: "A6",
    plateNumber: "AUD-5555",
    status: "in-progress",
    customerName: "Robert Taylor",
    valetId: "V004",
    valetName: "Sarah Johnson",
    valetPhone: "+1-555-0104",
    location: "Level 2, Row D",
    entryTime: "12:30 PM",
    duration: "45min",
    payment: 25.0,
    isPaid: false,
  },
];

export default function ManagerPage() {
  const [parkingData, setParkingData] =
    useState<ParkingSession[]>(INITIAL_PARKING_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "parked" | "in-progress" | "retrieved"
  >("all");
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(
    null
  );

  const filteredData = parkingData.filter(session => {
    const matchesSearch =
      session.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.valetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.carMake.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.carModel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || session.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    activeCars: parkingData.filter(s => s.status !== "retrieved").length,
    retrieving: parkingData.filter(s => s.status === "in-progress").length,
    totalToday: parkingData.length,
    revenue: parkingData
      .filter(s => s.isPaid)
      .reduce((sum, s) => sum + s.payment, 0),
  };

  const handleCallValet = (valetName: string) => {
    alert(`Calling ${valetName}...`);
  };

  const handleReassignValet = (parkingId: string, newValetId: string) => {
    setParkingData(prevData =>
      prevData.map(session => {
        if (session.id === parkingId) {
          const newValet = VALET_LIST.find(v => v.id === newValetId);
          if (newValet) {
            return {
              ...session,
              valetId: newValet.id,
              valetName: newValet.name,
              valetPhone: newValet.phone,
            };
          }
        }
        return session;
      })
    );
    setShowReassignModal(false);
    setSelectedParkingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "parked":
        return "bg-blue-500 text-white";
      case "in-progress":
        return "bg-yellow-500 text-white";
      case "retrieved":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const selectedParking = parkingData.find(p => p.id === selectedParkingId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 flex flex-col overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto pb-8 pr-2">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-blue-500">
            <p className="text-xs text-gray-600 font-semibold mb-2">
              ACTIVE CARS
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.activeCars}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-orange-500">
            <p className="text-xs text-gray-600 font-semibold mb-2">
              RETRIEVING
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.retrieving}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-purple-500">
            <p className="text-xs text-gray-600 font-semibold mb-2">
              TOTAL TODAY
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalToday}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-green-500">
            <p className="text-xs text-gray-600 font-semibold mb-2">REVENUE</p>
            <p className="text-2xl font-bold text-green-600">
              ${stats.revenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by plate, customer or valet..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:outline-none focus:border-emerald-500 bg-white"
          />
        </div>

        {/* Filter Tags */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "parked", "in-progress", "retrieved"].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                filterStatus === status
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-600 border-2 border-emerald-200"
              }`}>
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Parking Sessions List */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map(session => (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-4 shadow-md border-2 border-emerald-100">
                {/* Header with Status */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {session.carMake} {session.carModel}
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">
                      {session.plateNumber}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      session.status
                    )}`}>
                    {session.status.replace("-", " ").toUpperCase()}
                  </span>
                </div>

                {/* Customer Name */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold text-gray-800">
                    {session.customerName}
                  </p>
                </div>

                {/* Valet Info */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Valet Assigned</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {session.valetName}
                      </p>
                      <p className="text-xs text-gray-600">{session.valetId}</p>
                    </div>
                    <button
                      onClick={() => handleCallValet(session.valetName)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all">
                      <Phone size={16} weight="fill" />
                    </button>
                  </div>
                </div>

                {/* Reassign Valet Button */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedParkingId(session.id);
                      setShowReassignModal(true);
                    }}
                    className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-2">
                    <ArrowClockwise size={16} />
                    Reassign Valet
                  </button>
                </div>

                {/* Location */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-800">
                    {session.location}
                  </p>
                </div>

                {/* Entry Time & Duration */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Entry Time</p>
                  <p className="font-semibold text-gray-800">
                    {session.entryTime} - Duration: {session.duration}
                  </p>
                </div>

                {/* Payment Info */}
                <div className="mb-3 pb-3 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Payment</p>
                    <p className="font-semibold text-gray-800">
                      ${session.payment.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      session.isPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {session.isPaid ? "PAID" : "UNPAID"}
                  </span>
                </div>

                {/* Ticket ID */}
                <div className="text-center">
                  <p className="text-xs text-gray-600">Ticket ID</p>
                  <p className="font-mono font-bold text-gray-800">
                    {session.ticketId}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 font-semibold">
                No parking sessions found
              </p>
            </div>
          )}
        </div>

        {/* Reassign Valet Modal */}
        {showReassignModal && selectedParking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Select New Valet
              </h2>
              <div className="space-y-3">
                {VALET_LIST.map(valet => (
                  <button
                    key={valet.id}
                    onClick={() =>
                      handleReassignValet(selectedParking.id, valet.id)
                    }
                    className="w-full text-left bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-xl p-4 transition-all">
                    <p className="font-bold text-gray-800">{valet.name}</p>
                    <p className="text-xs text-gray-600">{valet.id}</p>
                    <p className="text-xs text-gray-600">{valet.phone}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedParkingId(null);
                }}
                className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-xl transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
