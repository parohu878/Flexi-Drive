const supabase = require('../config/supabase');

const notificationController = {
  getNotifications: async (req, res) => {
    try {
      const { data: user } = await supabase.from('users').select('id').eq('id_auth', req.user.id).single();
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = notificationController;
