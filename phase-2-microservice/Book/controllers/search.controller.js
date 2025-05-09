const { Book } = require('../models');
const { Op } = require('sequelize');

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
  