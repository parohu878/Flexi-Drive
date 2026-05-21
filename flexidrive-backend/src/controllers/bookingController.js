const supabase = require('../config/supabase');

const bookingController = {
  // Crear una reserva a partir de un match aceptado
  createBooking: async (req, res) => {
    const { match_id, fecha_inicio, fecha_fin, precio_total } = req.body;

    try {
      // 1. Obtener detalles del match y del vehículo
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*, vehicles(*, users(id))')
        .eq('id', match_id)
        .single();

      if (matchError || !match) throw new Error('Coincidencia no encontrada');

      // 2. Obtener ID del inquilino (el que está logueado)
      const { data: inquilino } = await supabase
        .from('users')
        .select('id')
        .eq('id_auth', req.user.id)
        .single();

      // 3. Crear la reserva (Booking)
      const codigoReserva = `FD-${Math.random().toString(36).toUpperCase().substring(2, 8)}`;
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          match_id,
          inquilino_id: inquilino.id,
          propietario_id: match.vehicles.propietario_id,
          vehicle_id: match.vehicle_id,
          fecha_inicio,
          fecha_fin,
          precio_total,
          codigo: codigoReserva,
          estado: 'confirmada'
        }])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 4. Actualizar el estado del match a 'aceptada'
      await supabase.from('matches').update({ estado: 'aceptada' }).eq('id', match_id);

      // 5. GENERAR NOTIFICACIONES
      await supabase.from('notifications').insert([
        {
          user_id: match.vehicles.propietario_id,
          tipo: 'reserva',
          mensaje: `¡Buenas noticias! Tu vehículo ${match.vehicles.marca} ha sido reservado. Código: ${codigoReserva}`
        },
        {
          user_id: inquilino.id,
          tipo: 'reserva',
          mensaje: `Tu reserva para el ${match.vehicles.marca} ha sido confirmada. ¡Disfruta del viaje!`
        }
      ]);

      res.status(201).json({ message: 'Reserva realizada con éxito', booking });

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener mis reservas (como inquilino o propietario)
  getMyBookings: async (req, res) => {
    try {
      const { data: user } = await supabase.from('users').select('id').eq('id_auth', req.user.id).single();

      const { data, error } = await supabase
        .from('bookings')
        .select('*, vehicles(marca, modelo)')
        .or(`inquilino_id.eq.${user.id},propietario_id.eq.${user.id}`)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = bookingController;
