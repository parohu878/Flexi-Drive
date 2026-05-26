const { getClient } = require('../config/supabase');
const crypto = require('crypto');

const bookingController = {
  // Crear una reserva directa
  createBooking: async (req, res) => {
    const { vehicle_id, fecha_inicio, fecha_fin, metodo_pago } = req.body;
    const supabase = getClient(req);

    try {
      if (!vehicle_id || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'Faltan campos requeridos: vehicle_id, fecha_inicio, fecha_fin.' });
      }

      // 1. Obtener detalles del vehículo
      const { data: vehicle, error: vehicleErr } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicle_id)
        .single();

      if (vehicleErr || !vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado.' });
      }

      // 2. Prevent booking own vehicle
      if (vehicle.propietario_id === req.user.id) {
        return res.status(400).json({ error: 'No puedes reservar tu propio vehículo.' });
      }

      // 3. Verificar solapamiento de fechas (overlap validation)
      const { data: overlaps, error: overlapErr } = await supabase
        .from('bookings')
        .select('id')
        .eq('vehicle_id', vehicle_id)
        .neq('estado', 'cancelada')
        .lte('fecha_inicio', fecha_fin)
        .gte('fecha_fin', fecha_inicio);

      if (overlapErr) throw overlapErr;

      if (overlaps && overlaps.length > 0) {
        return res.status(400).json({ error: 'El vehículo ya está reservado para las fechas seleccionadas.' });
      }

      // 4. Calcular precio total
      const start = new Date(fecha_inicio);
      const end = new Date(fecha_fin);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      const precio_total = diffDays * vehicle.precio_dia;

      // 5. Crear la reserva (Booking)
      const codigoReserva = `FD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          inquilino_id: req.user.id,
          propietario_id: vehicle.propietario_id,
          vehicle_id: parseInt(vehicle_id),
          fecha_inicio,
          fecha_fin,
          precio_total,
          codigo: codigoReserva,
          estado: 'confirmada',
          metodo_pago: metodo_pago || 'mano'
        }])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 6. Generar notificaciones
      await supabase.from('notifications').insert([
        {
          user_id: vehicle.propietario_id,
          tipo: 'reserva',
          mensaje: `¡Buenas noticias! Tu vehículo ha sido reservado. Código: ${codigoReserva}`
        },
        {
          user_id: req.user.id,
          tipo: 'reserva',
          mensaje: `Tu reserva para el vehículo ha sido confirmada. Código: ${codigoReserva}`
        }
      ]);

      res.status(201).json({ message: 'Reserva realizada con éxito', booking });

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener mis reservas (como inquilino o propietario)
  getMyBookings: async (req, res) => {
    const supabase = getClient(req);
    try {
      const user_id = req.user.id;

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*, vehicles(*, users!propietario_id(nombre, foto_perfil), vehicle_photos(*))')
        .or(`inquilino_id.eq.${user_id},propietario_id.eq.${user_id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Comprobar y actualizar estados en tiempo real al consultar
      const now = new Date();
      for (let i = 0; i < bookings.length; i++) {
        const booking = bookings[i];
        const start = new Date(booking.fecha_inicio);
        const end = new Date(booking.fecha_fin);
        let nuevoEstado = null;

        if (booking.estado === 'confirmada') {
          if (now >= end) {
            nuevoEstado = 'completada';
          } else if (now >= start) {
            nuevoEstado = 'en curs';
          }
        } else if (booking.estado === 'en curs') {
          if (now >= end) {
            nuevoEstado = 'completada';
          }
        }

        if (nuevoEstado) {
          const { error: updateErr } = await supabase
            .from('bookings')
            .update({ estado: nuevoEstado })
            .eq('id', booking.id);

          if (!updateErr) {
            booking.estado = nuevoEstado;

            // Generar notificaciones
            try {
              const userIds = [booking.propietario_id, booking.inquilino_id];
              const notificationsToInsert = userIds.map(uid => ({
                user_id: uid,
                tipo: nuevoEstado === 'en curs' ? 'en_curs' : 'completada',
                mensaje: nuevoEstado === 'en curs'
                  ? (uid === booking.inquilino_id 
                      ? `Tu reserva con código ${booking.codigo} ya ha comenzado y está en curso.`
                      : `La reserva con código ${booking.codigo} ha comenzado y ahora está en curso.`)
                  : (uid === booking.inquilino_id 
                      ? `Tu reserva con código ${booking.codigo} ha finalizado y ha sido completada.`
                      : `La reserva con código ${booking.codigo} ha finalizado y ha sido marcada como completada.`)
              }));

              await supabase.from('notifications').insert(notificationsToInsert);
            } catch (notifErr) {
              console.error('Error al generar notificaciones de transición:', notifErr);
            }
          }
        }
      }

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Cancelar una reserva
  cancelBooking: async (req, res) => {
    const supabase = getClient(req);
    const { id } = req.params;
    try {
      const { data: booking, error: fetchErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !booking) {
        return res.status(404).json({ error: 'Reserva no encontrada.' });
      }

      // Solo inquilino o propietario o admin
      if (booking.inquilino_id !== req.user.id && booking.propietario_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para cancelar esta reserva.' });
      }

      const { data, error } = await supabase
        .from('bookings')
        .update({ estado: 'cancelada' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Generar notificaciones
      await supabase.from('notifications').insert([
        {
          user_id: booking.propietario_id,
          tipo: 'cancelacion',
          mensaje: `La reserva con código ${booking.codigo} ha sido cancelada.`
        },
        {
          user_id: booking.inquilino_id,
          tipo: 'cancelacion',
          mensaje: `Has cancelado tu reserva con código ${booking.codigo}.`
        }
      ]);

      res.json({ message: 'Reserva cancelada con éxito', booking: data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Completar una reserva
  completeBooking: async (req, res) => {
    const supabase = getClient(req);
    const { id } = req.params;
    try {
      const { data: booking, error: fetchErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !booking) {
        return res.status(404).json({ error: 'Reserva no encontrada.' });
      }

      // Solo inquilino o propietario o admin
      if (booking.inquilino_id !== req.user.id && booking.propietario_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para completar esta reserva.' });
      }

      const { data, error } = await supabase
        .from('bookings')
        .update({ estado: 'completada' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Generar notificaciones
      await supabase.from('notifications').insert([
        {
          user_id: booking.propietario_id,
          tipo: 'completada',
          mensaje: `La reserva con código ${booking.codigo} ha sido marcada como completada.`
        },
        {
          user_id: booking.inquilino_id,
          tipo: 'completada',
          mensaje: `Tu reserva con código ${booking.codigo} ha sido completada.`
        }
      ]);

      res.json({ message: 'Reserva completada con éxito', booking: data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = bookingController;


