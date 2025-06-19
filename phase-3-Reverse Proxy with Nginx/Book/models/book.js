const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // Associations can be defined here if needed
    }
  }

  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0
      }
    },
    available_copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Book',
    underscored: true,
    hooks: {
      beforeCreate: (book) => {
        if (!book.available_copies) {
          book.available_copies = book.copies;
        }
      }
    }
  });

  return Book;
};