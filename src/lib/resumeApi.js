import api from './api'

export async function getResumeByEmail(email, userId) {
  const normalizedEmail = String(email || '').trim()
  const normalizedUserId = String(userId || '').trim()
  if (!normalizedEmail && !normalizedUserId) return null
  const { data } = await api.get('/resume', {
    params: {
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(normalizedUserId ? { userId: normalizedUserId } : {}),
    },
  })
  return data || null
}

export async function saveResume(payload) {
  const { data } = await api.post('/resume', payload)
  return data
}

export async function getResumeById(resumeId) {
  const normalizedId = String(resumeId || '').trim()
  if (!normalizedId) return null
  const { data } = await api.get(`/resumes/${normalizedId}`)
  return data || null
}
