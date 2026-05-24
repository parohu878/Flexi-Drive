const { getClient } = require('../config/supabase');

const notificationController = {
  getNotifications: async (req, res) => {
    const supabase = getClient(req);
    try {
      const user_id = req.user.id;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markAsRead: async (req, res) => {
    const supabase = getClient(req);
    const { id } = req.params;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ leida: true })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) throw error;
      res.json({ message: 'Notificación marcada como leída', notification: data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = notificationController;
