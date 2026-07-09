import { supabase } from '../lib/supabase'
import db from '../lib/db'
import { buscarCedula } from './cedula'

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
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      created_by: u.createdBy,
    }, { onConflict: 'username' }).select('username').single()

    if (!error) {
      await db.usuarios.update(u.username, { syncStatus: 'synced' })
    }
  }

  // Pull remote usuarios
  const { data: remote } = await supabase.from('usuarios').select('*')
  const remoteKeys = new Set()
  if (remote) {
    for (const r of remote) {
      const key = r.username.toLowerCase()
      remoteKeys.add(key)
      const local = await db.usuarios.get(key)
      if (!local) {
        await db.usuarios.add({
          username: key,
          password: r.password,
          role: r.role,
          nombre: r.nombre || '',
          apellido: r.apellido || '',
          createdBy: r.created_by,
          syncStatus: 'synced',
          createdAt: r.created_at,
        })
      }
    }
  }
  // Eliminar locales que ya no existen en remoto (excepto pendientes de sync)
  const allLocal = await db.usuarios.toArray()
  for (const u of allLocal) {
    if (u.syncStatus !== 'pending' && !remoteKeys.has(u.username)) {
      await db.usuarios.delete(u.username)
    }
  }
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
        let nombre = survey.nombre
        let apellido = survey.apellido
        if (!nombre || !apellido) {
          const data = await buscarCedula(survey.cedula)
          if (data) {
            nombre = data.nombre || nombre
            apellido = data.apellido || apellido
            await db.surveys.update(survey.localId, { nombre, apellido })
          }
        }

        const payload = {
          cedula: survey.cedula,
          nombre,
          apellido,
          genero: survey.genero || null,
          fecha_nacimiento: survey.fecha_nacimiento || null,
          direccion_fiscal: survey.direccion_fiscal,
          telefono: survey.telefono,
          nivel_ansiedad: survey.nivel_ansiedad || null,
          estado_familiar: survey.estado_familiar || null,
          condicion_vivienda: survey.condicion_vivienda || null,
          fallecimiento_familiares: survey.fallecimiento_familiares || null,
          familiares_desaparecidos: survey.familiares_desaparecidos || null,
          observacion_estado_familiar: survey.observacion_estado_familiar || null,
          observacion_condicion_vivienda: survey.observacion_condicion_vivienda || null,
          encuestador_id: survey.encuestadorId,
          local_id: String(survey.localId),
        }

        let remoteId = survey.remoteId
        if (remoteId) {
          const { error } = await supabase.from('encuestas').update(payload).eq('id', remoteId).select('id').single()
          if (error) throw error
        } else {
          const { data, error } = await supabase.from('encuestas').insert(payload).select('id').single()
          if (error) throw error
          remoteId = data.id
        }

        await db.surveys.update(survey.localId, {
          syncStatus: 'synced',
          remoteId,
        })

        if (survey.remoteId) {
          await supabase.from('familiares').delete().eq('encuesta_id', survey.remoteId)
        }

        const allFamily = await db.familyMembers
          .where('surveyLocalId')
          .equals(survey.localId)
          .toArray()

        for (const fm of allFamily) {
          let fmNombre = fm.nombre
          let fmApellido = fm.apellido
          if (!fmNombre || !fmApellido) {
            const fmData = await buscarCedula(fm.cedula)
            if (fmData) {
              fmNombre = fmData.nombre || fmNombre
              fmApellido = fmData.apellido || fmApellido
              await db.familyMembers.update(fm.localId, { nombre: fmNombre, apellido: fmApellido })
            }
          }

          const { error: fmError } = await supabase.from('familiares').insert({
            encuesta_id: remoteId,
            cedula: fm.cedula,
            nombre: fmNombre,
            apellido: fmApellido,
            parentesco: fm.parentesco,
            sexo: fm.sexo || null,
            fecha_nacimiento: fm.fecha_nacimiento || null,
            requiere_apoyo: fm.requiereApoyo || false,
            psico_nivel_ansiedad: fm.psico_nivel_ansiedad || null,
            psico_estado_familiar: fm.psico_estado_familiar || null,
            psico_condicion_vivienda: fm.psico_condicion_vivienda || null,
            psico_fallecimiento_familiares: fm.psico_fallecimiento_familiares || null,
            psico_familiares_desaparecidos: fm.psico_familiares_desaparecidos || null,
            psico_observacion_estado_familiar: fm.psico_observacion_estado_familiar || null,
            psico_observacion_condicion_vivienda: fm.psico_observacion_condicion_vivienda || null,
            psico_completado: fm.psico_completado || false,
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

export async function updateFamilyPsychTest(localId, psychData) {
  const fm = await db.familyMembers.get(localId)
  await db.familyMembers.update(localId, {
    ...psychData,
    syncStatus: 'pending',
  })
  if (!fm) return

  await db.surveys.update(fm.surveyLocalId, { syncStatus: 'pending' })

  if (navigator.onLine) {
    const survey = await db.surveys.get(fm.surveyLocalId)
    if (survey?.remoteId) {
      await supabase.from('familiares').delete().eq('encuesta_id', survey.remoteId).eq('cedula', fm.cedula)
      const { error } = await supabase.from('familiares').insert({
        encuesta_id: survey.remoteId,
        cedula: fm.cedula,
        nombre: fm.nombre || '',
        apellido: fm.apellido || '',
        parentesco: fm.parentesco || '',
        sexo: fm.sexo || null,
        fecha_nacimiento: fm.fecha_nacimiento || null,
        requiere_apoyo: fm.requiereApoyo || false,
        psico_nivel_ansiedad: psychData.psico_nivel_ansiedad || null,
        psico_estado_familiar: psychData.psico_estado_familiar || null,
        psico_condicion_vivienda: psychData.psico_condicion_vivienda || null,
        psico_fallecimiento_familiares: psychData.psico_fallecimiento_familiares || null,
        psico_familiares_desaparecidos: psychData.psico_familiares_desaparecidos || null,
        psico_observacion_estado_familiar: psychData.psico_observacion_estado_familiar || null,
        psico_observacion_condicion_vivienda: psychData.psico_observacion_condicion_vivienda || null,
        psico_completado: psychData.psico_completado || false,
      })
      if (error) {
        console.error('Error syncing family psych test:', error)
      } else {
        await db.familyMembers.update(localId, { syncStatus: 'synced' })
        await db.surveys.update(fm.surveyLocalId, { syncStatus: 'synced' })
      }
    }
  }
}

export async function updateSurveyPsychTest(localId, psychData) {
  await db.surveys.update(localId, {
    ...psychData,
    syncStatus: 'pending',
  })

  if (navigator.onLine) {
    const survey = await db.surveys.get(localId)
    if (survey?.remoteId) {
      try {
        const { error } = await supabase.from('encuestas').update({
          psico_nivel_ansiedad: psychData.psico_nivel_ansiedad || null,
          psico_estado_familiar: psychData.psico_estado_familiar || null,
          psico_condicion_vivienda: psychData.psico_condicion_vivienda || null,
          psico_fallecimiento_familiares: psychData.psico_fallecimiento_familiares || null,
          psico_familiares_desaparecidos: psychData.psico_familiares_desaparecidos || null,
          psico_observacion_estado_familiar: psychData.psico_observacion_estado_familiar || null,
          psico_observacion_condicion_vivienda: psychData.psico_observacion_condicion_vivienda || null,
          psico_completado: psychData.psico_completado || false,
        }).eq('id', survey.remoteId)
        if (!error) {
          await db.surveys.update(localId, { syncStatus: 'synced' })
        }
      } catch { /* column not in Supabase yet, keep local */ }
    }
  }
}

export async function updateSurveyLocally(localId, surveyData, familyMembers = []) {
  await db.surveys.update(localId, {
    ...surveyData,
    syncStatus: 'pending',
    updatedAt: new Date().toISOString(),
  })

  await db.familyMembers.where('surveyLocalId').equals(localId).delete()

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

export async function deleteSurvey(localId) {
  const survey = await db.surveys.get(localId)
  if (!survey) return

  await db.familyMembers.where('surveyLocalId').equals(localId).delete()
  await db.surveys.delete(localId)

  if (navigator.onLine) {
    if (survey.remoteId) {
      await supabase.from('familiares').delete().eq('encuesta_id', survey.remoteId)
      await supabase.from('encuestas').delete().eq('id', survey.remoteId)
    }
  }
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

  const remoteIds = new Set(data.map((r) => r.id))

  const localWithRemote = (await db.surveys.toArray()).filter((s) => s.remoteId)

  for (const local of localWithRemote) {
    if (!remoteIds.has(local.remoteId)) {
      await db.familyMembers.where('surveyLocalId').equals(local.localId).delete()
      await db.surveys.delete(local.localId)
    }
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
        nivel_ansiedad: remote.nivel_ansiedad || '',
        estado_familiar: remote.estado_familiar || '',
        condicion_vivienda: remote.condicion_vivienda || '',
        fallecimiento_familiares: remote.fallecimiento_familiares || '',
        familiares_desaparecidos: remote.familiares_desaparecidos || '',
        observacion_estado_familiar: remote.observacion_estado_familiar || '',
        observacion_condicion_vivienda: remote.observacion_condicion_vivienda || '',
        psico_nivel_ansiedad: remote.psico_nivel_ansiedad || '',
        psico_estado_familiar: remote.psico_estado_familiar || '',
        psico_condicion_vivienda: remote.psico_condicion_vivienda || '',
        psico_fallecimiento_familiares: remote.psico_fallecimiento_familiares || '',
        psico_familiares_desaparecidos: remote.psico_familiares_desaparecidos || '',
        psico_observacion_estado_familiar: remote.psico_observacion_estado_familiar || '',
        psico_observacion_condicion_vivienda: remote.psico_observacion_condicion_vivienda || '',
        psico_completado: remote.psico_completado || false,
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
          sexo: fm.sexo || '',
          fecha_nacimiento: fm.fecha_nacimiento || '',
          requiereApoyo: fm.requiere_apoyo || false,
          psico_nivel_ansiedad: fm.psico_nivel_ansiedad || '',
          psico_estado_familiar: fm.psico_estado_familiar || '',
          psico_condicion_vivienda: fm.psico_condicion_vivienda || '',
          psico_fallecimiento_familiares: fm.psico_fallecimiento_familiares || '',
          psico_familiares_desaparecidos: fm.psico_familiares_desaparecidos || '',
          psico_observacion_estado_familiar: fm.psico_observacion_estado_familiar || '',
          psico_observacion_condicion_vivienda: fm.psico_observacion_condicion_vivienda || '',
          psico_completado: fm.psico_completado || false,
          surveyLocalId: localId,
          syncStatus: 'synced',
          createdAt: fm.created_at,
        })
      }
    } else if (existing.syncStatus === 'synced') {
      await db.surveys.update(existing.localId, {
        cedula: remote.cedula,
        nombre: remote.nombre,
        apellido: remote.apellido,
        genero: remote.genero || null,
        fecha_nacimiento: remote.fecha_nacimiento || null,
        direccion_fiscal: remote.direccion_fiscal,
        telefono: remote.telefono,
        nivel_ansiedad: remote.nivel_ansiedad || '',
        estado_familiar: remote.estado_familiar || '',
        condicion_vivienda: remote.condicion_vivienda || '',
        fallecimiento_familiares: remote.fallecimiento_familiares || '',
        familiares_desaparecidos: remote.familiares_desaparecidos || '',
        observacion_estado_familiar: remote.observacion_estado_familiar || '',
        observacion_condicion_vivienda: remote.observacion_condicion_vivienda || '',
        psico_nivel_ansiedad: remote.psico_nivel_ansiedad || '',
        psico_estado_familiar: remote.psico_estado_familiar || '',
        psico_condicion_vivienda: remote.psico_condicion_vivienda || '',
        psico_fallecimiento_familiares: remote.psico_fallecimiento_familiares || '',
        psico_familiares_desaparecidos: remote.psico_familiares_desaparecidos || '',
        psico_observacion_estado_familiar: remote.psico_observacion_estado_familiar || '',
        psico_observacion_condicion_vivienda: remote.psico_observacion_condicion_vivienda || '',
        psico_completado: remote.psico_completado || false,
        updatedAt: remote.updated_at,
      })

      const existingFm = await db.familyMembers.where('surveyLocalId').equals(existing.localId).toArray()
      const existingFmByCedula = {}
      for (const ef of existingFm) {
        existingFmByCedula[ef.cedula] = ef
      }

      for (const fm of (remote.familiares || [])) {
        const localFm = existingFmByCedula[fm.cedula]
        const data = {
          cedula: fm.cedula,
          nombre: fm.nombre,
          apellido: fm.apellido,
          parentesco: fm.parentesco,
          sexo: fm.sexo || '',
          fecha_nacimiento: fm.fecha_nacimiento || '',
          requiereApoyo: fm.requiere_apoyo || false,
          psico_nivel_ansiedad: fm.psico_nivel_ansiedad || '',
          psico_estado_familiar: fm.psico_estado_familiar || '',
          psico_condicion_vivienda: fm.psico_condicion_vivienda || '',
          psico_fallecimiento_familiares: fm.psico_fallecimiento_familiares || '',
          psico_familiares_desaparecidos: fm.psico_familiares_desaparecidos || '',
          psico_observacion_estado_familiar: fm.psico_observacion_estado_familiar || '',
          psico_observacion_condicion_vivienda: fm.psico_observacion_condicion_vivienda || '',
          psico_completado: fm.psico_completado || false,
          surveyLocalId: existing.localId,
          syncStatus: 'synced',
          createdAt: fm.created_at,
        }

        if (localFm) {
          await db.familyMembers.update(localFm.localId, data)
        } else {
          await db.familyMembers.add(data)
        }
      }
    }
  }
}
