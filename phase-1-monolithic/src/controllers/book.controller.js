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

exports.searchBooks = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const searchCondition = search ? {
      [Op.or]: [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows: books } = await Book.findAndCountAll({
      where: searchCondition,
      order: [['title', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      books,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        hasMore: offset + books.length < count
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching books', error: error.message });
  }
};

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