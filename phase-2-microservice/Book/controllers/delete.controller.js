const { Book } = require('../models');
const { Op } = require('sequelize');

exports.deleteBook = async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      await book.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
  };