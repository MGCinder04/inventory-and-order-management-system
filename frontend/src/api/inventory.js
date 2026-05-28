import apiClient from './axiosInstance'

const INVENTORY_ENDPOINT = '/inventory'

export const inventoryApi = {
  list: () => apiClient.get(INVENTORY_ENDPOINT),
  adjust: (productId, payload) =>
    apiClient.patch(`${INVENTORY_ENDPOINT}/${productId}`, payload),
}
