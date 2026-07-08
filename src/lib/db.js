import Dexie from 'dexie'

const db = new Dexie('AyudappLuxor')

db.version(2).stores({
  surveys: '++localId, syncStatus, createdAt, encuestadorId',
  familyMembers: '++localId, surveyLocalId, syncStatus',
  syncQueue: '++id, type, action, createdAt',
  usuarios: '&username, role, syncStatus',
})

export default db
