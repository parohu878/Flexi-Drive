const { supabase, supabaseAdmin } = require('../config/supabase');

const authController = {
  // Para el registro de nuevos users
  register: async (req, res) => {
    const { email, password, nombre } = req.body;
    try {
      // 1. Registramos en "SupaBase Auth"
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario.');
      }

      // 2. Comprobar si el trigger ya ha creado el perfil en 'users' para evitar duplicaciones
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id_auth', authData.user.id)
        .maybeSingle();

      let userData = existingUser;
      if (!userData) {
        const { data: insertedUser, error: userError } = await supabaseAdmin
          .from('users')
          .insert([
            { 
              id_auth: authData.user.id, // Vinculamos con el ID de Auth de Supabase
              email, 
              nombre, 
              rol: email.toLowerCase().startsWith('admin') ? 'admin' : 'inquilino' // Rol predeterminado o admin automático por email
            }
          ])
          .select()
          .single();

        if (userError) throw userError;
        userData = insertedUser;
      }

      res.status(201).json({ 
        message: 'Usuario registrado con éxito', 
        user: userData,
        session: authData.session 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Inicio de sesión
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      if (!data.session) {
        return res.status(401).json({ error: 'Inicie sesión después de confirmar su email.' });
      }

      // Obtener el perfil público del usuario usando supabaseAdmin para evitar RLS
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id_auth', data.user.id)
        .maybeSingle();

      // Successful login
      return res.json({ 
        message: 'Login exitoso', 
        session: data.session,
        user: profile || { id_auth: data.user.id, email: data.user.email, rol: data.user.email.toLowerCase().startsWith('admin') ? 'admin' : 'inquilino' }
      });
    } catch (error) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
  },
};

module.exports = authController;


