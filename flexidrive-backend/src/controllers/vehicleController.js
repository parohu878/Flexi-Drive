const supabase = require('../config/supabase');

const vehicleController = {
  // Crear un nuevo vehículo
  createVehicle: async (req, res) => {
    const {
      make,
      model,
      matricula,
      year,
      mileage,
      location,
      city,
      lat,
      lng,
      pricePerHour,
      seats,
      fuel,
      transmission,
      minHours,
      description,
      features,
      availableFrom,
      availableTo
    } = req.body;

    try {
      // Get internal user ID (flexible lookup by id_auth or email)
      let userQuery = supabase.from('users').select('id, rol');
      if (req.user.id && !req.user.id.startsWith('demo-')) {
        userQuery = userQuery.eq('id_auth', req.user.id);
      } else {
        userQuery = userQuery.eq('email', req.user.email);
      }
      const { data: userData, error: userError } = await userQuery.single();

      if (userError || !userData) throw new Error('Usuario no encontrado');

      const { data, error } = await supabase
  .from('vehicles')
  .insert([
    {
      propietario_id: userData.id,
      marca: make,
      modelo: model,
      matricula,
      precio_dia: pricePerHour,
      latitud: lat,
      longitud: lng,
      direccion: location,
      radio_km: 0,
      // Optional fields with fallback defaults
      tipo: null,
      combustible: fuel,
      plazas: seats,
      transmision: transmission,
      descripcion: description,
      // Additional fields can be added as needed
    }
  ])
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
      let userQuery = supabase.from('users').select('id');
      if (req.user.id && !req.user.id.startsWith('demo-')) {
        userQuery = userQuery.eq('id_auth', req.user.id);
      } else {
        userQuery = userQuery.eq('email', req.user.email);
      }
      const { data: userData, error: userError } = await userQuery.single();
      
      if (userError || !userData) throw new Error('Usuario no encontrado');

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
