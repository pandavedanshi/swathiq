import axios from "axios"

const api = axios.create({ baseURL: "/api" })

export const dashboardAPI = {
  getSummary: () => api.get("/dashboard/summary"),
  getRecentSales: (limit = 10) => api.get(`/dashboard/recent-sales?limit=${limit}`),
}

export const inventoryAPI = {
  getOverview: () => api.get("/inventory/overview"),
  getMedicines: (params = {}) => api.get("/inventory/medicines", { params }),
  addMedicine: (data) => api.post("/inventory/medicines", data),
  updateMedicine: (id, data) => api.put(`/inventory/medicines/${id}`, data),
  updateStatus: (id, status) => api.patch(`/inventory/medicines/${id}/status`, { status }),
  deleteMedicine: (id) => api.delete(`/inventory/medicines/${id}`),
  getCategories: () => api.get("/inventory/categories"),
}

export const salesAPI = {
  createSale: (data) => api.post("/sales", data),
}

export default api