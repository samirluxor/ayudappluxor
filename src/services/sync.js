import { supabase } from '../lib/supabase'
import db from '../lib/db'

let isSyncing = false
let listeners = []

export function onSyncStatusChange(callback) {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter((l) => l !== callback)
  }
}

function notify(status) {
  listeners.forEach((fn) => fn(status))
}

export async function syncUsuarios() {
  if (!navigator.onLine) return

  const pending = await db.usuarios.where('syncStatus').equals('pending').toArray()

  for (const u of pending) {
    const { data, error } = await supabase.from('usuarios').upsert({
      username: u.username,
      password: u.password,
      role: u.role,
      created_by: u.createdBy,
    }, { onConflict: 'username' }).select('username').single()

    if (!error) {
      await db.usuarios.update(u.username, { syncStatus: 'synced' })
    }
  }

  // Pull remote usuarios
  const { data: remote, error } = await supabase.from('usuarios').select('*')
  if (error) { console.error('syncUsuarios error:', error); return }
  console.log('syncUsuarios: remote users found:', remote?.length, remote?.map(r => ({ username: r.username, role: r.role })))
  if (remote) {
    for (const r of remote) {
      const local = await db.usuarios.get(r.username)
      console.log('syncUsuarios: processing', r.username, 'local exists:', !!local)
      if (!local) {
        await db.usuarios.add({
          username: r.username,
          password: r.password,
          role: r.role,
          createdBy: r.created_by,
          syncStatus: 'synced',
          createdAt: r.created_at,
        })
      }
    }
  }
  const allLocal = await db.usuarios.toArray()
  console.log('syncUsuarios: all local users after sync:', allLocal.map(u => ({ username: u.username, role: u.role })))
}

export async function syncSurveys() {
  if (isSyncing) return
  isSyncing = true
  notify('syncing')

  try {
    const pendingSurveys = await db.surveys
      .where('syncStatus')
      .equals('pending')
      .toArray()

    for (const survey of pendingSurveys) {
      try {
        const { data, error } = await supabase.from('encuestas').insert({
          cedula: survey.cedula,
          nombre: survey.nombre,
          apellido: survey.apellido,
          genero: survey.genero || null,
          fecha_nacimiento: survey.fecha_nacimiento || null,
          direccion_fiscal: survey.direccion_fiscal,
          telefono: survey.telefono,
          encuestador_id: survey.encuestadorId,
          local_id: String(survey.localId),
        }).select('id').single()

        if (error) throw error

        await db.surveys.update(survey.localId, {
          syncStatus: 'synced',
          remoteId: data.id,
        })

        const pendingFamily = await db.familyMembers
          .where({ surveyLocalId: survey.localId, syncStatus: 'pending' })
          .toArray()

        for (const fm of pendingFamily) {
          const { error: fmError } = await supabase.from('familiares').insert({
            encuesta_id: data.id,
            cedula: fm.cedula,
            nombre: fm.nombre,
            apellido: fm.apellido,
            parentesco: fm.parentesco,
          })
          if (fmError) throw fmError
          await db.familyMembers.update(fm.localId, { syncStatus: 'synced' })
        }
      } catch (err) {
        await db.surveys.update(survey.localId, { syncStatus: 'error' })
        console.error('Error syncing survey:', survey.localId, err)
      }
    }

    notify('synced')
  } catch (err) {
    console.error('Sync error:', err)
    notify('error')
  } finally {
    isSyncing = false
  }
}

export async function saveSurveyLocally(surveyData, familyMembers = []) {
  const localId = await db.surveys.add({
    ...surveyData,
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  for (const fm of familyMembers) {
    await db.familyMembers.add({
      ...fm,
      surveyLocalId: localId,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
    })
  }

  if (navigator.onLine) {
    await syncSurveys()
  }

  return localId
}

export async function getLocalSurveys() {
  const surveys = await db.surveys.toArray()
  const result = []

  for (const survey of surveys) {
    const familyMembers = await db.familyMembers
      .where('surveyLocalId')
      .equals(survey.localId)
      .toArray()
    result.push({ ...survey, familyMembers })
  }

  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getLocalSurvey(localId) {
  const survey = await db.surveys.get(localId)
  if (!survey) return null
  const familyMembers = await db.familyMembers
    .where('surveyLocalId')
    .equals(localId)
    .toArray()
  return { ...survey, familyMembers }
}

export async function fetchRemoteSurveys(encuestadorId) {
  if (!navigator.onLine) return

  const { data, error } = await supabase
    .from('encuestas')
    .select('*, familiares(*)')
    .eq('encuestador_id', encuestadorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching remote surveys:', error)
    return
  }

  for (const remote of data) {
    const existing = await db.surveys
      .where('remoteId')
      .equals(remote.id)
      .first()

    if (!existing) {
      const localId = await db.surveys.add({
        cedula: remote.cedula,
        nombre: remote.nombre,
        apellido: remote.apellido,
        genero: remote.genero || null,
        fecha_nacimiento: remote.fecha_nacimiento || null,
        direccion_fiscal: remote.direccion_fiscal,
        telefono: remote.telefono,
        encuestadorId: remote.encuestador_id,
        remoteId: remote.id,
        syncStatus: 'synced',
        createdAt: remote.created_at,
        updatedAt: remote.updated_at,
      })

      for (const fm of (remote.familiares || [])) {
        await db.familyMembers.add({
          cedula: fm.cedula,
          nombre: fm.nombre,
          apellido: fm.apellido,
          parentesco: fm.parentesco,
          surveyLocalId: localId,
          syncStatus: 'synced',
          createdAt: fm.created_at,
        })
      }
    }
  }
}
