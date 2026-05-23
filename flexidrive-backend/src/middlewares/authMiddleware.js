const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  // 1. Obtener el token de la cabecera 'Authorization'
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
  }

  const token = authHeader.split(' ')[1];

  // Soporte para tokens demo en desarrollo/pruebas
  if (token.startsWith('demo-token:')) {
    const email = token.split(':')[1];
    try {
      const { data: usr, error: usrErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (usrErr || !usr) {
        return res.status(401).json({ error: 'Usuario demo no encontrado en la base de datos.' });
      }

      req.user = {
        id: usr.id_auth || `demo-id-${usr.id}`,
        email: usr.email
      };
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Token demo inválido o error en consulta.' });
    }
  }

  try {
    // 2. Verificar el token con Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    // 3. Si el token es válido, guardamos los datos del usuario en 'req'
    // Esto permite que los siguientes controladores sepan QUIÉN está haciendo la petición
    req.user = user;
    
    // 4. Continuar con la siguiente función (el controlador)
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error interno al verificar la sesión.' });
  }
};

module.exports = authMiddleware;
