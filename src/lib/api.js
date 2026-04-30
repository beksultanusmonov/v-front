import axios from 'axios'

const API_BASE_URL = 'https://v-back-production.up.railway.app/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export default api