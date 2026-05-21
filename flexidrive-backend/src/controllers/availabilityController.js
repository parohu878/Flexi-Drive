const supabase = require('../config/supabase');

const availabilityController = {
  // Añadir un rango de disponibilidad para un vehículo
  addAvailability: async (req, res) => {
    const { vehicle_id, fecha_inicio, fecha_fin } = req.body;

    try {
      // 1. Verificar que el vehículo pertenece al usuario que hace la petición
      const { data: vehicle, error: vError } = await supabase
        .from('vehicles')
        .select('propietario_id, users!inner(id_auth)')
        .eq('id', vehicle_id)
        .single();

      if (vError || !vehicle) throw new Error('Vehículo no encontrado');
      
      // Seguridad: Solo el dueño puede poner disponibilidad
      if (vehicle.users.id_auth !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para gestionar este vehículo' });
      }

      // 2. Insertar la disponibilidad
      const { data, error } = await supabase
        .from('availabilities')
        .insert([{
          vehicle_id,
          fecha_inicio,
          fecha_fin,
          disponible: true
        }])
        .select();

      if (error) throw error;
      res.status(201).json({ message: 'Disponibilidad añadida correctamente', data: data[0] });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener la disponibilidad de un vehículo específico
  getVehicleAvailability: async (req, res) => {
    const { vehicle_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('availabilities')
        .select('*')
        .eq('vehicle_id', vehicle_id)
        .eq('disponible', true)
        .order('fecha_inicio', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = availabilityController;
