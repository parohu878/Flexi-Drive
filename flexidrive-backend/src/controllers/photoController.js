const { getClient } = require('../config/supabase');
const multer = require('multer');

// Configuración básica de Multer (guarda en memoria temporalmente)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit in Multer config as well
});

const photoController = {
  uploadMiddleware: upload.single('image'), // Nombre del campo que vendrá del frontend

  uploadVehiclePhoto: async (req, res) => {
    try {
      const { vehicle_id } = req.params;
      const file = req.file;

      if (!file) return res.status(400).json({ error: 'No se ha subido ninguna imagen' });

      const supabase = getClient(req);

      // 1. Verificar si el vehículo existe y pertenece al usuario
      const { data: vehicle, error: fetchError } = await supabase
        .from('vehicles')
        .select('propietario_id')
        .eq('id', vehicle_id)
        .single();

      if (fetchError || !vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      if (vehicle.propietario_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para añadir fotos a este vehículo' });
      }

      // 2. Validar formato de archivo
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Tipo de archivo no soportado. Debe ser JPEG, PNG o WEBP.' });
      }

      // 3. Generar un nombre único para el archivo
      const fileExt = file.originalname.split('.').pop() || 'jpg';
      const fileName = `${vehicle_id}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // 4. Subir la imagen a Supabase Storage usando el cliente autenticado
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 5. Obtener la URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filePath);

      // 6. Guardar la URL en la tabla 'vehicle_photos'
      const { data: photoData, error: photoError } = await supabase
        .from('vehicle_photos')
        .insert([{
          vehicle_id: parseInt(vehicle_id),
          url_foto: publicUrl,
          es_principal: req.body.es_principal === 'true' || req.body.es_principal === true || false
        }])
        .select();

      if (photoError) throw photoError;

      res.status(201).json({ message: 'Foto subida con éxito', photo: photoData[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = photoController;


