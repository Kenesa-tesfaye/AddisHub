import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crh-backend-production.up.railway.app'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})
