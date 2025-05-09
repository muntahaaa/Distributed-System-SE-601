const { Book } = require('../models');
const { Op } = require('sequelize');

exports.createBook = async (req, res) => {
    try {
      const { title, author, isbn, copies } = req.body;
  
      const existingBook = await Book.findOne({ where: { isbn } });
      if (existingBook) {
        return res.status(400).json({ message: 'Book with this ISBN already exists' });
      }
  
      const book = await Book.create({
        title,
        author,
        isbn,
        copies,
        available_copies: copies
      });
  
      res.status(201).json(book);
    } catch (error) {
      res.status(500).json({ message: 'Error creating book', error: error.message });
    }
  };
  