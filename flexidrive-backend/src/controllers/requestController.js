const supabase = require('../config/supabase');

const requestController = {
  // 1. Crear una nueva solicitud y buscar coincidencias
  createRequest: async (req, res) => {
    const { fecha_inicio, fecha_fin, latitud, longitud, radio_km, tipo_vehiculo, precio_max_dia } = req.body;

    try {
      // Obtener ID del inquilino
      const { data: userData } = await supabase.from('users').select('id').eq('id_auth', req.user.id).single();

      // Insertar la solicitud (request)
      const { data: request, error: reqError } = await supabase
        .from('requests')
        .insert([{
          inquilino_id: userData.id,
          fecha_inicio, fecha_fin, latitud, longitud, radio_km, tipo_vehiculo, precio_max_dia
        }])
        .select()
        .single();

      if (reqError) throw reqError;

      // --- LÓGICA DE MATCHING ---
      // Buscamos vehículos que cumplan los criterios básicos
      let query = supabase
        .from('vehicles')
        .select('*, availabilities!inner(*)')
        .eq('activo', true)
        .lte('precio_dia', precio_max_dia || 999999)
        .gte('availabilities.fecha_inicio', fecha_inicio)
        .lte('availabilities.fecha_fin', fecha_fin);

      if (tipo_vehiculo && tipo_vehiculo !== 'cualquiera') {
        query = query.eq('tipo', tipo_vehiculo);
      }

      const { data: potentialVehicles, error: matchError } = await query;

      if (matchError) throw matchError;

      // Filtrar por distancia (simplificado para esta fase) e insertar en 'matches'
      const matchesToInsert = potentialVehicles.map(vehicle => ({
        request_id: request.id,
        vehicle_id: vehicle.id,
        precio: vehicle.precio_dia,
        estado: 'propuesta'
      }));

      if (matchesToInsert.length > 0) {
        await supabase.from('matches').insert(matchesToInsert);
      }

      res.status(201).json({ 
        message: 'Solicitud creada', 
        request, 
        matches_encontrados: matchesToInsert.length 
      });

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // 2. Obtener las coincidencias (matches) de una solicitud
  getMatches: async (req, res) => {
    const { request_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, vehicles(*)')
        .eq('request_id', request_id);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = requestController;
