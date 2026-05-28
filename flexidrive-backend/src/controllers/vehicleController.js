const { getClient } = require('../config/supabase');

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

    const supabase = getClient(req);

    try {
      if (!make || !model || !matricula || !pricePerHour) {
        return res.status(400).json({ error: 'Marca, modelo, matrícula y precio son obligatorios.' });
      }

      const propietario_id = req.user.id;

      const { data, error } = await supabase
        .from('vehicles')
        .insert([
          {
            propietario_id,
            marca: make,
            modelo: model,
            matricula,
            año: year ? parseInt(year) : null,
            km: mileage ? parseInt(mileage) : 0,
            precio_dia: pricePerHour ? parseFloat(pricePerHour) : 0,
            combustible: fuel,
            transmision: transmission,
            plazas: seats ? parseInt(seats) : 5,
            direccion: location,
            latitud: lat ? parseFloat(lat) : null,
            longitud: lng ? parseFloat(lng) : null,
            descripcion: description,
            activo: true,
            disponible_desde: availableFrom || '08:00',
            disponible_hasta: availableTo || '20:00',
            caracteristicas: features || []
          }
        ])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json({ message: 'Vehículo creado con éxito', vehicle: data });
    } catch (error) {
      let errorMsg = error.message;
      if (error.code === '23505' || errorMsg.includes('unique constraint') || errorMsg.includes('vehicles_matricula_key')) {
        errorMsg = 'La matrícula introducida ya está registrada por otro vehículo.';
      }
      res.status(400).json({ error: errorMsg });
    }
  },

  // Listar todos los vehículos activos (para búsqueda general)
  getAllVehicles: async (req, res) => {
    const supabase = getClient(req);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, users!propietario_id(nombre, foto_perfil), vehicle_photos(*)')
        .eq('activo', true);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener vehículos de un propietario específico (mis coches)
  getMyVehicles: async (req, res) => {
    const supabase = getClient(req);
    try {
      const propietario_id = req.user.id;

      const { data, error } = await supabase
        .from('vehicles')
        .select('*, users!propietario_id(nombre, foto_perfil), vehicle_photos(*)')
        .eq('propietario_id', propietario_id);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un vehículo por ID (detalle)
  getVehicleById: async (req, res) => {
    const supabase = getClient(req);
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, users!propietario_id(*), vehicle_photos(*)')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar un vehículo
  updateVehicle: async (req, res) => {
    const supabase = getClient(req);
    const { id } = req.params;
    const updates = req.body;
    try {
      // 1. Verificar si el vehículo existe y pertenece al usuario
      const { data: vehicle, error: fetchError } = await supabase
        .from('vehicles')
        .select('propietario_id')
        .eq('id', id)
        .single();

      if (fetchError || !vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      if (vehicle.propietario_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para actualizar este vehículo' });
      }

      // 2. Mapear y actualizar campos
      const mappedUpdates = {
        marca: updates.make,
        modelo: updates.model,
        matricula: updates.matricula,
        año: updates.year ? parseInt(updates.year) : undefined,
        km: updates.mileage ? parseInt(updates.mileage) : undefined,
        precio_dia: updates.pricePerHour ? parseFloat(updates.pricePerHour) : undefined,
        combustible: updates.fuel,
        transmision: updates.transmission,
        plazas: updates.seats ? parseInt(updates.seats) : undefined,
        direccion: updates.location,
        latitud: updates.lat ? parseFloat(updates.lat) : undefined,
        longitud: updates.lng ? parseFloat(updates.lng) : undefined,
        descripcion: updates.description,
        activo: updates.activo,
        disponible_desde: updates.availableFrom,
        disponible_hasta: updates.availableTo,
        caracteristicas: updates.features
      };

      // Eliminar campos undefined
      Object.keys(mappedUpdates).forEach(key => mappedUpdates[key] === undefined && delete mappedUpdates[key]);

      const { data, error } = await supabase
        .from('vehicles')
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json({ message: 'Vehículo actualizado con éxito', vehicle: data });
    } catch (error) {
      let errorMsg = error.message;
      if (error.code === '23505' || errorMsg.includes('unique constraint') || errorMsg.includes('vehicles_matricula_key')) {
        errorMsg = 'La matrícula introducida ya está registrada por otro vehículo.';
      }
      res.status(400).json({ error: errorMsg });
    }
  },

  // Eliminar un vehículo de la base de datos (borrado físico completo)
  deleteVehicle: async (req, res) => {
    const supabase = getClient(req);
    const { id } = req.params;
    try {
      // 1. Verificar si el vehículo existe
      const { data: vehicle, error: fetchError } = await supabase
        .from('vehicles')
        .select('propietario_id')
        .eq('id', id)
        .single();

      if (fetchError || !vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      // 2. Solo el propietario del coche o el administrador pueden borrar
      if (vehicle.propietario_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este vehículo' });
      }

      // 3. Borrado en cascada de los registros relacionados para evitar fallos de integridad referencial (foreign keys)
      // Eliminar fotos del coche
      await supabase.from('vehicle_photos').delete().eq('vehicle_id', id);
      
      // Eliminar de los favoritos de los usuarios
      await supabase.from('favorites').delete().eq('vehicle_id', id);
      
      // Eliminar las disponibilidades del coche (si existiera la tabla availabilities)
      await supabase.from('availabilities').delete().eq('vehicle_id', id);

      // Eliminar las reservas asociadas. Las reviews se borrarán automáticamente en cascada en la base de datos.
      await supabase.from('bookings').delete().eq('vehicle_id', id);

      // 4. Borrar físicamente el vehículo de la base de datos
      const { data, error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json({ message: 'Vehículo eliminado físicamente con éxito', vehicle: data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener todos los vehículos de la plataforma, incluyendo inactivos (Admin)
  getAllVehiclesAdmin: async (req, res) => {
    const supabase = getClient(req);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, users!propietario_id(nombre, email, foto_perfil), vehicle_photos(*)')
        .order('id', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = vehicleController;


