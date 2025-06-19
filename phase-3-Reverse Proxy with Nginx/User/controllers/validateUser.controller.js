const { User } = require('../models');

exports.validateToken = async (req, res) => {
    // If the request reaches here, it means the token is valid
    // (checked by authenticate middleware)
    res.json({ 
      valid: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  };
