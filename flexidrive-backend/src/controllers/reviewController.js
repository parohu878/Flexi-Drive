const supabase = require('../config/supabase');

const reviewController = {
  // Crear una nueva reseña
  createReview: async (req, res) => {
    const { booking_id, destinatario_id, puntuacion, comentario, tipo } = req.body;

    try {
      // 1. Obtener ID del autor (el usuario logueado)
      const { data: autor } = await supabase
        .from('users')
        .select('id')
        .eq('id_auth', req.user.id)
        .single();

      // 2. Insertar la reseña
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          booking_id,
          autor_id: autor.id,
          destinatario_id,
          puntuacion,
          comentario,
          tipo
        }])
        .select();

      if (error) throw error;

      // 3. Opcional: Notificar al destinatario que ha recibido una valoración
      await supabase.from('notifications').insert([{
        user_id: destinatario_id,
        tipo: 'valoracion',
        mensaje: `Has recibido una nueva valoración de ${puntuacion} estrellas.`
      }]);

      res.status(201).json({ message: 'Reseña publicada con éxito', review: data[0] });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener reseñas de un usuario o vehículo específico
  getReviews: async (req, res) => {
    const { type, id } = req.query; // type: 'user' o 'vehicle'
    try {
      let query = supabase.from('reviews').select('*, users!autor_id(nombre, foto_perfil)');
      
      if (type === 'user') {
        query = query.eq('destinatario_id', id);
      } else if (type === 'vehicle') {
        // Para vehículos, filtramos a través de la reserva vinculada
        const { data: bookings } = await supabase.from('bookings').select('id').eq('vehicle_id', id);
        const bookingIds = bookings.map(b => b.id);
        query = query.in('booking_id', bookingIds).eq('tipo', 'inquilino_a_vehiculo');
      }

      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = reviewController;
