-- Tabla de trabajadores
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  tarifa_hora INTEGER NOT NULL,
  dias_trabajo TEXT[] NOT NULL,
  hora_entrada_programada TEXT NOT NULL,
  hora_salida_programada TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de bonos
CREATE TABLE IF NOT EXISTS public.bonos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bono1_valor INTEGER NOT NULL DEFAULT 0,
  bono2_valor INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial de bonos
INSERT INTO public.bonos (bono1_valor, bono2_valor)
VALUES (0, 0)
ON CONFLICT DO NOTHING;

-- Insertar trabajadores iniciales
INSERT INTO public.workers (nombre, tarifa_hora, dias_trabajo, hora_entrada_programada, hora_salida_programada)
VALUES
  ('ricardo gall', 4850, ARRAY['Lu', 'Ma', 'Mi', 'Ju', 'Vi'], '08:00', '14:00'),
  ('eze perez', 4850, ARRAY['Ju', 'Vi', 'Sa', 'Mi'], '08:00', '14:00'),
  ('pablo', 4850, ARRAY['Lu', 'Ma', 'Mi', 'Ju', 'Vi'], '08:00', '14:00'),
  ('caccho', 4850, ARRAY['Vi', 'Sa', 'Ma', 'Mi', 'Ju'], '09:00', '14:00'),
  ('camilo palle', 4850, ARRAY['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'], '08:00', '14:00'),
  ('ezequiel par', 4850, ARRAY['Lu', 'Ma', 'Mi', 'Ju', 'Vi'], '08:00', '14:00'),
  ('alexis perez', 4850, ARRAY['Lu', 'Ma', 'Mi', 'Ju', 'Vi'], '08:00', '14:00'),
  ('jesus diaz', 4850, ARRAY['Lu', 'Ma', 'Mi', 'Ju', 'Vi'], '08:00', '14:00'),
  ('franco lopez', 4850, ARRAY['Lu', 'Ma', 'Mi', 'Ju', 'Vi'], '08:00', '14:00'),
  ('lucho', 4850, ARRAY['Lu', 'Ma', 'Mi', 'Ju', 'Vi'], '08:00', '14:00'),
  ('valentino', 4850, ARRAY['Lu', 'Ma', 'Mi', 'Ju', 'Vi'], '08:00', '14:00')
ON CONFLICT (nombre) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir lectura y escritura pública (sin autenticación)
-- Nota: En producción, deberías agregar autenticación
CREATE POLICY "Allow public read access on workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on workers" ON public.workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on workers" ON public.workers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on workers" ON public.workers FOR DELETE USING (true);

CREATE POLICY "Allow public read access on bonos" ON public.bonos FOR SELECT USING (true);
CREATE POLICY "Allow public update on bonos" ON public.bonos FOR UPDATE USING (true);
