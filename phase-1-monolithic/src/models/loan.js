const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    static associate(models) {
      Loan.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Loan.belongsTo(models.Book, {
        foreignKey: 'book_id',
        as: 'book'
      });
    }
  }

  Loan.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    return_date: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'RETURNED', 'OVERDUE'),
      defaultValue: 'ACTIVE'
    },
    extensions_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Loan',
    underscored: true,
    hooks: {
      beforeCreate: async (loan, options) => {
        const book = await sequelize.models.Book.findByPk(loan.book_id);
        if (book.available_copies <= 0) {
          throw new Error('No copies available for loan');
        }
        await book.decrement('available_copies', { transaction: options.transaction });
      },
      afterCreate: (loan) => {
        if (new Date(loan.due_date) < new Date()) {
          loan.status = 'OVERDUE';
        }
      },
      beforeUpdate: async (loan) => {
        if (loan.changed('return_date') && loan.return_date) {
          loan.status = 'RETURNED';
          await sequelize.models.Book.increment('available_copies', {
            where: { id: loan.book_id }
          });
        }
      }
    }
  });

  return Loan;
};