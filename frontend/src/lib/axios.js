import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Endpoints
export const Service = {
  auth: {
    getCsrf: () => api.get("/sanctum/csrf-cookie"),
    login: (credential) => api.post("/api/login", credential),
    logout: () => api.post("/api/logout")
  },

  assets: {
    list: (params) => api.get("/api/assets", { params }),
    create: (formData) =>
      api.post("/api/assets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    get: (id) => api.get(`/api/assets/${id}`),
    update: (id, formData) => {
      if (formData && formData instanceof FormData) {
        if (!formData.has("_method")) {
          formData.append("_method", "PUT");
        }
        return api.post(`/api/assets/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      // Jika data dikirim sebagai JSON biasa
      return api.put(`/api/assets/${id}`, formData);
    },
    delete: (id) => api.delete(`/api/assets/${id}`),
  },

  loans: {
    list: (params) => api.get("/api/loans", { params }),
    create: (data) => api.post("/api/loans", data),
    get: (id) => api.get(`/api/loans/${id}`),
    approve: (id) => api.post(`/api/loans/${id}/approve`),
    reject: (id, reason) => api.post(`/api/loans/${id}/reject`, { reason }),
    return: (id) => api.post(`/api/loans/${id}/return`),
  },

  categories: {
    list: (params) => api.get("/api/categories", { params }),
    get: (id) => api.get(`/api/categories/${id}`),
    create: (data) => api.post("/api/categories", data),
    update: (id, data) => api.put(`/api/categories/${id}`, data),
    delete: (id) => api.delete(`/api/categories/${id}`),
  },

  locations: {
    list: (params) => api.get("/api/locations", { params }),
    get: (id) => api.get(`/api/locations/${id}`),
    create: (data) => api.post("/api/locations", data),
    createHierarchy: (data) => api.post("/api/locations/hierarchy", data),
    update: (id, data) => {
      if (data instanceof FormData) {
        if (!data.has("_method")) data.append("_method", "PUT");
        return api.post(`/api/locations/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return api.put(`/api/locations/${id}`, data);
    },
    delete: (id) => api.delete(`/api/locations/${id}`),
  },

  statuses: {
    list: () => api.get("/api/asset-status"),
    get: (id) => api.get(`/api/asset-status/${id}`),
    create: (data) => api.post("/api/asset-status", data),
    update: (id, data) => api.put(`/api/asset-status/${id}`, data),
    delete: (id) => api.delete(`/api/asset-status/${id}`),
  },

  suppliers: {
    list: (params) => api.get("/api/suppliers", { params }),
    get: (id) => api.get(`/api/suppliers/${id}`),
    create: (data) => api.post("/api/suppliers", data),
    update: (id, data) => api.put(`/api/suppliers/${id}`, data),
    delete: (id) => api.delete(`/api/suppliers/${id}`),
  },

  maintenances: {
    list: (params) => api.get("/api/maintenances", { params }),
    get: (id) => api.get(`/api/maintenances/${id}`),
    create: (data) => api.post("api/maintenances", data),
    update: (id, data) => api.put(`/api/maintenances/${id}`, data),
  },

  resources: {
    categories: () =>
      api.get("/api/categories?per_page=100&only_children=true"),
    locations: (type, parentId = null) => {
      let url = `/api/locations?type=${type}`;
      if (parentId) url += `&parent_id=${parentId}`;
      return api.get(url);
    },
    statuses: () => api.get("/api/asset-status"),
    suppliers: () => api.get("/api/suppliers?per_page=100"),
    units: () => api.get("/api/units"),
    deployableAssets: (params) =>
      api.get("/api/assets?only_deployable=true&per_page=100", { params }),
  },
};

export default api;
