const supabase = require('../config/supabase');

const vehicleController = {
  // Crear un nuevo vehículo
  createVehicle: async (req, res) => {
    const { 
      marca, modelo, matricula, tipo, combustible, plazas, 
      transmision, descripcion, precio_dia, latitud, longitud, 
      direccion, radio_km 
    } = req.body;

    try {
      // 1. Obtener el ID interno del usuario desde nuestra tabla 'users' usando el id_auth
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, rol')
        .eq('id_auth', req.user.id)
        .single();

      if (userError || !userData) throw new Error('Usuario no encontrado');
      
      // 2. Opcional: Validar si es propietario (puedes quitarlo si permites que todos suban)
      if (userData.rol === 'inquilino') {
        return res.status(403).json({ error: 'Debes ser propietario para subir un vehículo' });
      }

      // 3. Insertar el vehículo
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          propietario_id: userData.id,
          marca, modelo, matricula, tipo, combustible, plazas,
          transmision, descripcion, precio_dia, latitud, longitud,
          direccion, radio_km
        }])
        .select();

      if (error) throw error;
      res.status(201).json({ message: 'Vehículo creado con éxito', vehicle: data[0] });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Listar todos los vehículos activos (para búsqueda general)
  getAllVehicles: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, users(nombre, foto_perfil)')
        .eq('activo', true);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener vehículos de un propietario específico (mis coches)
  getMyVehicles: async (req, res) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id_auth', req.user.id)
        .single();

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('propietario_id', userData.id);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = vehicleController;
