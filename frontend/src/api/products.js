import apiClient from './axiosInstance'

const PRODUCTS_ENDPOINT = '/products'

export const productsApi = {
  list: (params) => apiClient.get(PRODUCTS_ENDPOINT, { params }),
  getById: (id) => apiClient.get(`${PRODUCTS_ENDPOINT}/${id}`),
  create: (payload) => apiClient.post(PRODUCTS_ENDPOINT, payload),
  update: (id, payload) => apiClient.put(`${PRODUCTS_ENDPOINT}/${id}`, payload),
  remove: (id) => apiClient.delete(`${PRODUCTS_ENDPOINT}/${id}`),
}
