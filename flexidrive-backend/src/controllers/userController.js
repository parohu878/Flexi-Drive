const { getClient } = require('../config/supabase');

const userController = {
  // Obtener el perfil del usuario autenticado
  getProfile: async (req, res) => {
    try {
      // El perfil completo ya fue obtenido y validado en el authMiddleware
      res.json(req.user);
    } catch (error) {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  },

  // Actualizar perfil (nombre, teléfono, ciudad, foto, etc.)
  updateProfile: async (req, res) => {
    const { nombre, telefono, ciudad, latitud, longitud, foto_perfil } = req.body;
    const supabase = getClient(req);
    
    try {
      const updates = {};
      if (nombre !== undefined) updates.nombre = nombre;
      if (telefono !== undefined) updates.telefono = telefono;
      if (ciudad !== undefined) updates.ciudad = ciudad;
      if (latitud !== undefined) updates.latitud = latitud ? parseFloat(latitud) : null;
      if (longitud !== undefined) updates.longitud = longitud ? parseFloat(longitud) : null;
      if (foto_perfil !== undefined) updates.foto_perfil = foto_perfil;

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) throw error;
      res.json({ message: 'Perfil actualizado con éxito', user: data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener estadísticas reales del usuario
  getStats: async (req, res) => {
    const supabase = getClient(req);
    try {
      const user_id = req.user.id;

      // 1. Número total de alquileres (como inquilino o propietario)
      const { count: totalRentals, error: countError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .or(`inquilino_id.eq.${user_id},propietario_id.eq.${user_id}`)
        .neq('estado', 'cancelada');

      if (countError) throw countError;

      // 2. Valoración media recibida (reviews where destinatario_id = user_id)
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('puntuacion')
        .eq('destinatario_id', user_id);

      if (reviewsError) throw reviewsError;

      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.puntuacion, 0) / reviews.length
        : 5.0;

      // 3. Ingresos totales (como propietario)
      const { data: earnings, error: earningsError } = await supabase
        .from('bookings')
        .select('precio_total')
        .eq('propietario_id', user_id)
        .in('estado', ['confirmada', 'en curs', 'completada']);

      if (earningsError) throw earningsError;

      const totalEarnings = earnings && earnings.length > 0
        ? earnings.reduce((sum, b) => sum + (parseFloat(b.precio_total) || 0), 0)
        : 0;

      res.json({
        totalRentals: totalRentals || 0,
        rating: parseFloat(avgRating.toFixed(1)),
        earnings: totalEarnings,
        reviewsCount: reviews ? reviews.length : 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;


