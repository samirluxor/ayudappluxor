-- Ejecutar esto en el SQL Editor de Supabase
-- ATENCIÓN: DROP TABLE borra datos existentes. Usa solo si empiezas desde cero.

DROP TABLE IF EXISTS familiares CASCADE;
DROP TABLE IF EXISTS encuestas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Tabla de usuarios (encuestadores + admin)
CREATE TABLE usuarios (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'encuestador' CHECK (role IN ('admin', 'encuestador')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de encuestas
CREATE TABLE encuestas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  encuestador_id TEXT NOT NULL REFERENCES usuarios(username),
  cedula TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  genero TEXT,
  fecha_nacimiento DATE,
  direccion_fiscal TEXT,
  telefono TEXT,
  local_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de familiares
CREATE TABLE familiares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  encuesta_id UUID NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  cedula TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  parentesco TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_encuestas_encuestador ON encuestas(encuestador_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_cedula ON encuestas(cedula);
CREATE INDEX IF NOT EXISTS idx_familiares_encuesta ON familiares(encuesta_id);

-- Permitir acceso anónimo (la seguridad está en la app local)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE familiares ENABLE ROW LEVEL SECURITY;

-- Políticas: permitir todo al anon key (la app maneja su propia auth local)
DROP POLICY IF EXISTS "Acceso público a usuarios" ON usuarios;
DROP POLICY IF EXISTS "Acceso público a encuestas" ON encuestas;
DROP POLICY IF EXISTS "Acceso público a familiares" ON familiares;
CREATE POLICY "Acceso público a usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público a encuestas" ON encuestas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público a familiares" ON familiares FOR ALL USING (true) WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS encuestas_updated_at ON encuestas;
CREATE TRIGGER encuestas_updated_at
  BEFORE UPDATE ON encuestas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
