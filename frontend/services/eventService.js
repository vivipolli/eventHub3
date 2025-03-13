// Chaves para o localStorage
const EVENTS_KEY = 'event3_events'
const EVENT_METADATA_KEY = 'event3_metadata'

// Função auxiliar para verificar se estamos no navegador
const isBrowser = typeof window !== 'undefined'

// Função para salvar evento e seus metadados
export const saveEvent = (eventData, metadataUrl, imageUrl) => {
  if (!isBrowser) return null

  try {
    // Recuperar eventos existentes
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]')

    // Criar novo evento com metadados
    const newEvent = {
      ...eventData,
      id: eventData.id || Date.now().toString(),
      metadataUrl,
      imageUrl,
      createdAt: new Date().toISOString(),
    }

    // Adicionar novo evento
    events.push(newEvent)

    // Salvar no localStorage
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events))

    return newEvent
  } catch (error) {
    console.error('Error saving event:', error)
    throw error
  }
}

// Função para recuperar um evento específico
export const getEvent = eventId => {
  if (!isBrowser) return null

  try {
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]')
    return events.find(event => event.id.toString() === eventId.toString())
  } catch (error) {
    console.error('Error getting event:', error)
    return null
  }
}

// Função para listar todos os eventos
export const getAllEvents = () => {
  if (!isBrowser) return []

  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]')
  } catch (error) {
    console.error('Error getting all events:', error)
    return []
  }
}

// Opcional: Função para limpar todos os eventos (útil para testes)
export const clearEvents = () => {
  if (!isBrowser) return

  try {
    localStorage.removeItem(EVENTS_KEY)
  } catch (error) {
    console.error('Error clearing events:', error)
  }
}
