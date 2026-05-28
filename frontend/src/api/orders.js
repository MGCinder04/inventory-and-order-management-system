import apiClient from './axiosInstance'

const ORDERS_ENDPOINT = '/orders'

export const ordersApi = {
  list: (params) => apiClient.get(ORDERS_ENDPOINT, { params }),
  getById: (id) => apiClient.get(`${ORDERS_ENDPOINT}/${id}`),
  create: (payload) => apiClient.post(ORDERS_ENDPOINT, payload),
  updateStatus: (id, status) =>
    apiClient.patch(`${ORDERS_ENDPOINT}/${id}/status`, { status }),
  remove: (id) => apiClient.delete(`${ORDERS_ENDPOINT}/${id}`),
}
