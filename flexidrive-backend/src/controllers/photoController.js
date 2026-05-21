const supabase = require('../config/supabase');
const multer = require('multer');

// Configuración básica de Multer (guarda en memoria temporalmente)
const upload = multer({ storage: multer.memoryStorage() });

const photoController = {
  uploadMiddleware: upload.single('image'), // Nombre del campo que vendrá del frontend

  uploadVehiclePhoto: async (req, res) => {
    try {
      const { vehicle_id } = req.params;
      const file = req.file;

      if (!file) return res.status(400).json({ error: 'No se ha subido ninguna imagen' });

      // 1. Generar un nombre único para el archivo
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${vehicle_id}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // 2. Subir la imagen a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, file.buffer, {
          contentType: file.mimeType,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Obtener la URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filePath);

      // 4. Guardar la URL en la tabla 'vehicle_photos'
      const { data: photoData, error: photoError } = await supabase
        .from('vehicle_photos')
        .insert([{
          vehicle_id: vehicle_id,
          url_foto: publicUrl,
          es_principal: req.body.es_principal || false
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
