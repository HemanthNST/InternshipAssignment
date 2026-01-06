import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ PARKING API ============
export const parkingAPI = {
  getUserSessions: (userId: string) =>
    apiClient.get(`/parking/sessions/user/${userId}`),

  createSession: (data: {
    userId: string;
    vehicleId: string;
    siteId: string;
    status: string;
  }) => apiClient.post("/parking/sessions", data),

  updateSession: (sessionId: string, data: { status: string }) =>
    apiClient.patch(`/parking/sessions/${sessionId}`, data),

  getSessionByTicket: (ticketId: string) =>
    apiClient.get(`/parking/sessions/ticket/${ticketId}`),
};

// ============ TEST API (Development) ============
export const testAPI = {
  getTestUser: () => apiClient.get("/test/test-user"),

  getTestDriver: () => apiClient.get("/test/test-driver"),

  getTestAdmin: () => apiClient.get("/test/test-admin"),

  getUserVehicles: (userId: string) =>
    apiClient.get(`/test/user/${userId}/vehicles`),

  getSites: () => apiClient.get("/test/sites"),
};

// ============ ASSIGNMENT API ============
export const assignmentAPI = {
  getDriverAssignments: (driverId: string) =>
    apiClient.get(`/assignments/driver/${driverId}`),

  createAssignment: (data: {
    driverId: string;
    sessionId: string;
    type: "park" | "retrieve";
  }) => apiClient.post("/assignments", data),

  acceptAssignment: (assignmentId: string) =>
    apiClient.patch(`/assignments/${assignmentId}/accept`),

  completeAssignment: (assignmentId: string) =>
    apiClient.patch(`/assignments/${assignmentId}/complete`),

  getDriverStats: (driverId: string) =>
    apiClient.get(`/assignments/stats/${driverId}`),
};

// ============ MANAGER API ============
export const managerAPI = {
  getSessions: (params?: {
    status?: string;
    siteId?: string;
    search?: string;
  }) => apiClient.get("/manager/sessions", { params }),

  reassignValet: (sessionId: string, valetId: string) =>
    apiClient.patch(`/manager/sessions/${sessionId}/reassign-valet`, {
      valetId,
    }),

  getValetsBySite: (siteId: string) =>
    apiClient.get(`/manager/valets/${siteId}`),
};

// ============ ADMIN API ============
export const adminAPI = {
  getSiteStats: (siteId: string) => apiClient.get(`/admin/stats/${siteId}`),

  getAllSites: () => apiClient.get("/admin/sites"),

  getPendingApprovals: () => apiClient.get("/admin/approvals/pending"),

  getAllApprovals: () => apiClient.get("/admin/approvals"),

  approveDriver: (approvalId: string) =>
    apiClient.patch(`/admin/approvals/${approvalId}/approve`),

  rejectDriver: (approvalId: string) =>
    apiClient.patch(`/admin/approvals/${approvalId}/reject`),

  resetDatabase: () => apiClient.post("/admin/reset-database"),
};

export default apiClient;
