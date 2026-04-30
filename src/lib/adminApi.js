import api from './api'

export async function fetchAdminOverview() {
  const { data } = await api.get('/admin/overview')
  return data
}

export async function adminSetVacancyStatus(vacancyId, status) {
  const { data } = await api.put(`/admin/vacancies/${vacancyId}/status`, { status })
  return data
}

export async function adminDeleteVacancy(vacancyId) {
  const { data } = await api.delete(`/admin/vacancies/${vacancyId}`)
  return data
}

export async function adminDeleteUser(userId) {
  const { data } = await api.delete(`/admin/users/${userId}`)
  return data
}
