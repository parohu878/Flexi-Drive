const { supabase } = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  // 1. Obtener el token de la cabecera 'Authorization'
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verificar el token con Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    // 3. Buscar el perfil en la base de datos pública usando el ID de autenticación
    const { data: dbUser, error: dbUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id_auth', user.id)
      .single();

    if (dbUserError || !dbUser) {
      // Si el perfil no existe, intentamos crearlo con datos básicos del auth user
      const nombreDefault = user.user_metadata?.nombre || user.email.split('@')[0];
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert([{
          id_auth: user.id,
          email: user.email,
          nombre: nombreDefault,
          rol: 'inquilino'
        }])
        .select()
        .single();

      if (createError) {
        return res.status(401).json({ error: 'Perfil de usuario no encontrado y no pudo ser creado.' });
      }
      req.user = newProfile;
    } else {
      req.user = dbUser;
    }
    
    // 4. Continuar con la siguiente función (el controlador)
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error interno al verificar la sesión.' });
  }
};

module.exports = authMiddleware;

