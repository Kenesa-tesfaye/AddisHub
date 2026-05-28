import { apiClient } from './client'

export const createResource = async (resource) => {
  const payload = Object.entries(resource).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) acc[key] = value
    return acc
  }, {})

  const response = await apiClient.post('/resources', payload)
  return response.data
}

export const createEvent = async (eventData) => {
  const response = await apiClient.post('/events', eventData)
  return response.data
}

export const deleteResource = async (resourceId) => {
  const response = await apiClient.delete(`/resources/${resourceId}`)
  return response.data
}

export const deleteEvent = async (eventId) => {
  const response = await apiClient.delete(`/events/${eventId}`)
  return response.data
}
