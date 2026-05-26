-- FlexiDrive Database Schema & Security Migration

-- 1. Actualización de tablas existentes (agregar columnas faltantes)

-- VEHICLES: Agregar año, km, disponible_desde, disponible_hasta, caracteristicas
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS año INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS km INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS disponible_desde TEXT DEFAULT '08:00';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS disponible_hasta TEXT DEFAULT '20:00';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS caracteristicas TEXT[] DEFAULT '{}'::TEXT[];

-- USERS: Garantizar que id_auth sea único y tenga los campos necesarios
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_auth UUID UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rol TEXT NOT NULL DEFAULT 'inquilino' CHECK (rol IN ('inquilino', 'propietario', 'admin'));

-- BOOKINGS: Agregar created_at si no existe
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- BOOKINGS: Permitir nulos en match_id si la columna existe (flujo directo de reservas)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='bookings' AND column_name='match_id'
    ) THEN
        ALTER TABLE public.bookings ALTER COLUMN match_id DROP NOT NULL;
    END IF;
END $$;

-- NOTIFICATIONS: Agregar created_at si no existe
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Creación de nuevas tablas (si no existen)

-- VEHICLE_PHOTOS
CREATE TABLE IF NOT EXISTS public.vehicle_photos (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    url_foto TEXT NOT NULL,
    es_principal BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    autor_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    destinatario_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5) NOT NULL,
    comentario TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('inquilino_a_propietario', 'propietario_a_inquilino', 'inquilino_a_vehiculo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    vehicle_id BIGINT REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, vehicle_id)
);

-- NOTIFICATIONS (Asegurar campos si se crea de cero)
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Índices para mejorar rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_vehicles_activo ON public.vehicles(activo);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_main ON public.vehicle_photos(vehicle_id) WHERE es_principal = true;

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Creación de Políticas RLS (con DROP previo para evitar duplicados si se vuelve a correr)
DO $$
BEGIN
    -- USERS
    DROP POLICY IF EXISTS "Permitir lectura pública de perfiles" ON public.users;
    DROP POLICY IF EXISTS "Permitir actualización a usuarios dueños de su fila" ON public.users;
    DROP POLICY IF EXISTS "Permitir inserción de perfiles de usuario" ON public.users;
    
    -- VEHICLES
    DROP POLICY IF EXISTS "Permitir lectura pública de vehículos activos" ON public.vehicles;
    DROP POLICY IF EXISTS "Permitir inserción de vehículos a autenticados" ON public.vehicles;
    DROP POLICY IF EXISTS "Permitir actualización de vehículos a propietarios" ON public.vehicles;
    
    -- VEHICLE_PHOTOS
    DROP POLICY IF EXISTS "Permitir lectura pública de fotos" ON public.vehicle_photos;
    DROP POLICY IF EXISTS "Permitir gestión de fotos a propietarios del coche" ON public.vehicle_photos;
    
    -- BOOKINGS
    DROP POLICY IF EXISTS "Permitir lectura de reservas a involucrados" ON public.bookings;
    DROP POLICY IF EXISTS "Permitir lectura de reservas asociadas a reviews" ON public.bookings;
    DROP POLICY IF EXISTS "Permitir inserción de reservas a inquilinos" ON public.bookings;
    DROP POLICY IF EXISTS "Permitir cancelación de reservas a involucrados" ON public.bookings;
    
    -- REVIEWS
    DROP POLICY IF EXISTS "Permitir lectura pública de reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Permitir inserción de reviews a autores autenticados" ON public.reviews;
    
    -- FAVORITES
    DROP POLICY IF EXISTS "Permitir lectura de favoritos propia" ON public.favorites;
    DROP POLICY IF EXISTS "Permitir inserción de favoritos propia" ON public.favorites;
    DROP POLICY IF EXISTS "Permitir borrado de favoritos propia" ON public.favorites;
    
    -- NOTIFICATIONS
    DROP POLICY IF EXISTS "Permitir lectura de notificaciones propia" ON public.notifications;
    DROP POLICY IF EXISTS "Permitir actualización de notificaciones propia" ON public.notifications;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Crear políticas
CREATE POLICY "Permitir lectura pública de perfiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Permitir actualización a usuarios dueños de su fila" ON public.users FOR UPDATE USING (auth.uid() = id_auth);
CREATE POLICY "Permitir inserción de perfiles de usuario" ON public.users FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura pública de vehículos activos" ON public.vehicles FOR SELECT USING (activo = true OR auth.uid() IN (SELECT id_auth FROM public.users WHERE id = propietario_id));
CREATE POLICY "Permitir inserción de vehículos a autenticados" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() IN (SELECT id_auth FROM public.users WHERE id = propietario_id));
CREATE POLICY "Permitir actualización de vehículos a propietarios" ON public.vehicles FOR UPDATE USING (auth.uid() IN (SELECT id_auth FROM public.users WHERE id = propietario_id));

CREATE POLICY "Permitir lectura pública de fotos" ON public.vehicle_photos FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de fotos a propietarios del coche" ON public.vehicle_photos FOR ALL USING (auth.uid() IN (
    SELECT u.id_auth FROM public.users u JOIN public.vehicles v ON v.propietario_id = u.id WHERE v.id = vehicle_id
));

CREATE POLICY "Permitir lectura de reservas a involucrados" ON public.bookings FOR SELECT USING (auth.uid() IN (
    SELECT id_auth FROM public.users WHERE id = inquilino_id OR id = propietario_id
));
CREATE POLICY "Permitir lectura de reservas asociadas a reviews" ON public.bookings FOR SELECT USING (id IN (SELECT booking_id FROM public.reviews));
CREATE POLICY "Permitir inserción de reservas a inquilinos" ON public.bookings FOR INSERT WITH CHECK (auth.uid() IN (SELECT id_auth FROM public.users WHERE id = inquilino_id));
CREATE POLICY "Permitir cancelación de reservas a involucrados" ON public.bookings FOR UPDATE USING (auth.uid() IN (
    SELECT id_auth FROM public.users WHERE id = inquilino_id OR id = propietario_id
));

CREATE POLICY "Permitir lectura pública de reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de reviews a autores autenticados" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IN (SELECT id_auth FROM public.users WHERE id = autor_id));

CREATE POLICY "Permitir lectura de favoritos propia" ON public.favorites FOR SELECT USING (auth.uid() IN (SELECT id_auth FROM public.users WHERE id = user_id));
CREATE POLICY "Permitir inserción de favoritos propia" ON public.favorites FOR INSERT WITH CHECK (auth.uid() IN (SELECT id_auth FROM public.users WHERE id = user_id));
CREATE POLICY "Permitir borrado de favoritos propia" ON public.favorites FOR DELETE USING (auth.uid() IN (SELECT id_auth FROM public.users WHERE id = user_id));

CREATE POLICY "Permitir lectura de notificaciones propia" ON public.notifications FOR SELECT USING (auth.uid() IN (SELECT id_auth FROM public.users WHERE id = user_id));
CREATE POLICY "Permitir actualización de notificaciones propia" ON public.notifications FOR UPDATE USING (auth.uid() IN (SELECT id_auth FROM public.users WHERE id = user_id));

-- 6. Trigger para creación automática de perfil en public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id_auth, email, nombre, rol)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)), 'inquilino')
  ON CONFLICT (id_auth) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Configuración de Storage para Fotos de Vehículos
-- Crear el bucket 'vehicle-images' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas RLS para el bucket 'vehicle-images'
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir lectura de imágenes pública" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir subida de imágenes a usuarios autenticados" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir borrado de imágenes a propietarios" ON storage.objects;
EXCEPTION
    WHEN others THEN NULL;
END $$;

CREATE POLICY "Permitir lectura de imágenes pública" ON storage.objects
    FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "Permitir subida de imágenes a usuarios autenticados" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'vehicle-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Permitir borrado de imágenes a propietarios" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'vehicle-images' 
        AND auth.role() = 'authenticated'
    );

-- 8. Función para actualizar automáticamente el estado de las reservas y generar notificaciones
CREATE OR REPLACE FUNCTION public.update_booking_statuses()
RETURNS void AS $$
DECLARE
  b RECORD;
BEGIN
  -- 1. Actualizar reservas a 'en curs'
  FOR b IN 
    SELECT id, propietario_id, inquilino_id, codigo
    FROM public.bookings
    WHERE estado = 'confirmada'
      AND fecha_inicio <= now()
      AND fecha_fin > now()
  LOOP
    UPDATE public.bookings SET estado = 'en curs' WHERE id = b.id;
    
    INSERT INTO public.notifications (user_id, tipo, mensaje, leida)
    VALUES 
      (b.propietario_id, 'en_curs', 'La reserva con código ' || b.codigo || ' ha comenzado y ahora está en curso.', false),
      (b.inquilino_id, 'en_curs', 'Tu reserva con código ' || b.codigo || ' ya ha comenzado y está en curso.', false);
  END LOOP;

  -- 2. Actualizar reservas a 'completada'
  FOR b IN 
    SELECT id, propietario_id, inquilino_id, codigo
    FROM public.bookings
    WHERE (estado = 'confirmada' OR estado = 'en curs')
      AND fecha_fin <= now()
  LOOP
    UPDATE public.bookings SET estado = 'completada' WHERE id = b.id;
    
    INSERT INTO public.notifications (user_id, tipo, mensaje, leida)
    VALUES 
      (b.propietario_id, 'completada', 'La reserva con código ' || b.codigo || ' ha finalizado y ha sido marcada como completada.', false),
      (b.inquilino_id, 'completada', 'Tu reserva con código ' || b.codigo || ' ha finalizado y ha sido completada.', false);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Columna para almacenar el método de pago
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'mano';

