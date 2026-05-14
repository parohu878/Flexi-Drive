const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../config/db');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'flexi_dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Tots els camps són obligatoris' });

    if (password.length < 6)
      return res.status(400).json({ error: 'La contrasenya ha de tenir mínim 6 caràcters' });

    const exists = users.find(u => u.email === email.toLowerCase());
    if (exists)
      return res.status(409).json({ error: 'Aquest correu ja està registrat' });

    const passwordHash = await bcrypt.hash(password, 10);
    const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      avatar: initials,
      verified: false,
      rating: 0,
      totalReservations: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    const token = signToken(newUser.id);

    const { passwordHash: _, ...userPublic } = newUser;
    res.status(201).json({ token, user: userPublic });
  } catch (err) {
    res.status(500).json({ error: 'Error intern del servidor' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email i contrasenya obligatoris' });

    const user = users.find(u => u.email === email.toLowerCase());
    if (!user)
      return res.status(401).json({ error: 'Credencials incorrectes' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: 'Credencials incorrectes' });

    const token = signToken(user.id);
    const { passwordHash: _, ...userPublic } = user;
    res.json({ token, user: userPublic });
  } catch (err) {
    res.status(500).json({ error: 'Error intern del servidor' });
  }
};

// GET /api/auth/me  (protected)
exports.me = (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuari no trobat' });

  const { passwordHash: _, ...userPublic } = user;
  res.json(userPublic);
};
