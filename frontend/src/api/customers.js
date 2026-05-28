import apiClient from './axiosInstance'

const CUSTOMERS_ENDPOINT = '/customers'

export const customersApi = {
  list: (params) => apiClient.get(CUSTOMERS_ENDPOINT, { params }),
  getById: (id) => apiClient.get(`${CUSTOMERS_ENDPOINT}/${id}`),
  create: (payload) => apiClient.post(CUSTOMERS_ENDPOINT, payload),
  update: (id, payload) => apiClient.put(`${CUSTOMERS_ENDPOINT}/${id}`, payload),
  remove: (id) => apiClient.delete(`${CUSTOMERS_ENDPOINT}/${id}`),
}
