function resolveApiOrigin() {
  const raw = 'http://localhost:4000/api'
  try {
    const url = new URL(raw, window.location.origin)
    return url.origin
  } catch {
    return 'http://localhost:4000'
  }
}

function createSseSubscription(path, params, onEvent) {
  const apiOrigin = resolveApiOrigin()
  const query = new URLSearchParams(params)
  const url = `${apiOrigin}${path}?${query.toString()}`
  let source = null
  let reconnectTimer = null
  let isClosed = false

  const connect = () => {
    if (isClosed) return
    source = new EventSource(url)
    source.onmessage = (event) => {
      if (typeof onEvent !== 'function') return
      try {
        onEvent({ type: 'message', payload: JSON.parse(event.data || '{}') })
      } catch {
        onEvent({ type: 'message', payload: null })
      }
    }
    source.addEventListener('vacancy_created', (event) => onTypedEvent('vacancy_created', event))
    source.addEventListener('vacancy_updated', (event) => onTypedEvent('vacancy_updated', event))
    source.addEventListener('vacancy_deleted', (event) => onTypedEvent('vacancy_deleted', event))
    source.addEventListener('application_submitted', (event) => onTypedEvent('application_submitted', event))
    source.addEventListener('application_sent', (event) => onTypedEvent('application_sent', event))
    source.addEventListener('application_withdrawn', (event) => onTypedEvent('application_withdrawn', event))
    source.addEventListener('application_status_changed', (event) => onTypedEvent('application_status_changed', event))
    source.onerror = () => {
      source?.close()
      source = null
      if (!isClosed) reconnectTimer = window.setTimeout(connect, 2000)
    }
  }

  const onTypedEvent = (type, event) => {
    if (typeof onEvent !== 'function') return
    try {
      onEvent({ type, payload: JSON.parse(event.data || '{}') })
    } catch {
      onEvent({ type, payload: null })
    }
  }

  connect()

  return () => {
    isClosed = true
    if (reconnectTimer) window.clearTimeout(reconnectTimer)
    source?.close()
  }
}

export function subscribeCompanyEvents({ ownerUserId, onEvent }) {
  if (!ownerUserId) return () => {}
  return createSseSubscription('/api/events/company', { ownerUserId }, onEvent)
}

export function subscribeEmployeeEvents({ userId, email, onEvent }) {
  if (!userId && !email) return () => {}
  return createSseSubscription('/api/events/employee', { userId: userId || '', email: email || '' }, onEvent)
}
