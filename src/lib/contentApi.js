import api from './api'

export async function fetchVacancies(params = undefined) {
  const { data } = await api.get('/vacancies', params ? { params } : undefined)
  return Array.isArray(data) ? data : []
}

export async function fetchVacancyById(id) {
  const { data } = await api.get(`/vacancies/${id}`)
  return data || null
}

export async function createVacancy(payload) {
  const { data } = await api.post('/vacancies', payload)
  return data
}

export async function updateVacancy(vacancyId, payload) {
  const { data } = await api.put(`/vacancies/${vacancyId}`, payload)
  return data
}

export async function deleteVacancy(vacancyId, payload) {
  const { data } = await api.delete(`/vacancies/${vacancyId}`, { data: payload })
  return data
}

export async function applyToVacancy(vacancyId, payload) {
  const { data } = await api.post(`/vacancies/${vacancyId}/apply`, payload)
  return data
}

export async function withdrawFromVacancy(vacancyId, payload) {
  const { data } = await api.delete(`/vacancies/${vacancyId}/apply`, { data: payload })
  return data
}

export async function fetchCourses() {
  const { data } = await api.get('/courses')
  return Array.isArray(data) ? data : []
}

export async function fetchCourseById(courseId) {
  const { data } = await api.get(`/courses/${courseId}`)
  return data
}

export async function fetchCourseProgress(courseId, userId) {
  const { data } = await api.get(`/courses/${courseId}/progress`, { params: { userId } })
  return data
}

export async function completeCourseLesson(courseId, payload) {
  const { data } = await api.post(`/courses/${courseId}/complete-lesson`, payload)
  return data
}

export async function fetchCertificates(userId) {
  const { data } = await api.get('/certificates', { params: { userId } })
  return Array.isArray(data) ? data : []
}

export async function fetchFaqs() {
  const { data } = await api.get('/faqs')
  return Array.isArray(data) ? data : []
}

export async function fetchStats() {
  try {
    const { data } = await api.get('/stats')
    return data || null
  } catch {
    return null
  }
}
