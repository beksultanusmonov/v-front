import axios from 'axios'

const API_BASE_URL = 'https://railway.com/project/237f61c7-da8d-4808-a3e3-f179e30008d4/service/74f619bb-3a97-4f0a-af1e-64e40c72c66c?environmentId=2c7f2e83-9646-4210-8b51-3a92645eaf9c' || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export default api
