const supabase = require('../config/supabase');

const authController = {
  // Para el registro de nuevos users
  register: async (req, res) => {
    const { email, password, nombre, rol } = req.body;
    try {
      // 1. Registramos en "SupaBase Auth"
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Los datos secundarios los insertamos en nuestra tabla en nuestra base de datos
      // Supabase Auth crea el usuario, pero nosotros queremos guardarlo en nuestra tabla personalizada
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          { 
            id_auth: authData.user.id, // Vinculamos con el ID de Auth de Supabase
            email, 
            nombre, 
            rol: rol || 'inquilino' 
          }
        ])
        .select();

      if (userError) throw userError;

      res.status(201).json({ message: 'Usuario registrado con éxito', user: userData });
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

      if (error) throw error;

      res.json({ message: 'Login exitoso', session: data.session });
    } catch (error) {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  }
};

module.exports = authController;
