const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.hasMany(models.Loan, {
        foreignKey: 'book_id',
        as: 'loans'
      });
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