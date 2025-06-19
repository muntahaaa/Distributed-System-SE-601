const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    static associate(models) {
      // Removed associations for microservice architecture
    }
  }

  Loan.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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
      beforeCreate: async (loan) => {
        if (new Date(loan.due_date) < new Date()) {
          loan.status = 'OVERDUE';
        }
      },
      beforeUpdate: async (loan) => {
        if (loan.changed('return_date') && loan.return_date) {
          loan.status = 'RETURNED';
        }
      }
    }
  });

  return Loan;
};