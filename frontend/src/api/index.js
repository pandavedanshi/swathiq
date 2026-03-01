import axios from "axios"

const api = axios.create({
  baseURL: "https://swasthiq-backend-mi4j.onrender.com"
})

export const dashboardAPI = {
  getSummary: () => api.get("/api/dashboard/summary"),
  getRecentSales: (limit = 10) => api.get(`/api/dashboard/recent-sales?limit=${limit}`),
}

export const inventoryAPI = {
  getOverview: () => api.get("/api/inventory/overview"),
  getMedicines: (params = {}) => api.get("/api/inventory/medicines", { params }),
  addMedicine: (data) => api.post("/api/inventory/medicines", data),
  updateMedicine: (id, data) => api.put(`/api/inventory/medicines/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/inventory/medicines/${id}/status`, { status }),
  deleteMedicine: (id) => api.delete(`/api/inventory/medicines/${id}`),
  getCategories: () => api.get("/api/inventory/categories"),
}

export const salesAPI = {
  createSale: (data) => api.post("/api/sales", data),
}

export default api