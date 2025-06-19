const { Book } = require('../models');
const { Op } = require('sequelize');

exports.updateBook = async (req, res) => {
    try {
      const { title, author, isbn, copies, available_copies } = req.body;
      const book = await Book.findByPk(req.params.id);
  
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      if (isbn && isbn !== book.isbn) {
        const existingBook = await Book.findOne({ where: { isbn } });
        if (existingBook) {
          return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }
      }
  
      const updates = {};
      if (title) updates.title = title;
      if (author) updates.author = author;
      if (isbn) updates.isbn = isbn;
      if (copies !== undefined) updates.copies = copies;
      if (available_copies !== undefined) updates.available_copies = available_copies;
  
      await book.update(updates);
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: 'Error updating book', error: error.message });
    }
  };
  