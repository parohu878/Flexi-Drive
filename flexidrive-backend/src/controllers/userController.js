const supabase = require('../config/supabase');

const userController = {
  // Obtener el perfil del usuario autenticado
  getProfile: async (req, res) => {
    try {
      // El id viene del authMiddleware (req.user.id)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id_auth', req.user.id)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  },

  // Actualizar perfil (nombre, teléfono, ciudad, foto, etc.)
  updateProfile: async (req, res) => {
    const { nombre, telefono, ciudad, latitud, longitud, foto_perfil, rol } = req.body;
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ nombre, telefono, ciudad, latitud, longitud, foto_perfil, rol })
        .eq('id_auth', req.user.id)
        .select();

      if (error) throw error;
      res.json({ message: 'Perfil actualizado con éxito', user: data[0] });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = userController;
