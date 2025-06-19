const { Book } = require('../models');
const { Op } = require('sequelize');

exports.getBookById = async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching book', error: error.message });
    }
  };
  