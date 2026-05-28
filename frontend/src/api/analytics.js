import apiClient from './axiosInstance'

const ANALYTICS_ENDPOINT = '/analytics'

export const analyticsApi = {
  getSummary: (days) =>
    apiClient.get(`${ANALYTICS_ENDPOINT}/summary`, { params: days ? { days } : {} }),
}
