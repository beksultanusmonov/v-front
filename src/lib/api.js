import axios from 'axios'

const API_BASE_URL = 'https://v-back-nkqs.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export default api