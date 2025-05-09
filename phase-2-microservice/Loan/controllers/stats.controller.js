const { Loan } = require('../models');
const { Op, fn, col } = require('sequelize');

exports.getUserLoanStats = async (req, res) => {
    try {
      const stats = await Loan.findAll({
        attributes: [
          'user_id',
          [fn('COUNT', col('id')), 'loan_count']
        ],
        group: ['user_id'],
        order: [[fn('COUNT', col('id')), 'DESC']]
      });
  
      res.json(stats.map(stat => ({
        user_id: stat.user_id,
        loan_count: parseInt(stat.get('loan_count'))
      })));
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching user loan statistics', 
        error: error.message 
      });
    }
  };

exports.getBookLoanStats = async (req, res) => {
  try {
    const stats = await Loan.findAll({
      attributes: [
        'book_id',
        [fn('COUNT', col('id')), 'loan_count']
      ],
      group: ['book_id'],
      order: [[fn('COUNT', col('id')), 'DESC']]
    });

    res.json(stats.map(stat => ({
      book_id: stat.book_id,
      loan_count: parseInt(stat.get('loan_count'))
    })));
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching book loan statistics',
      error: error.message
    });
  }
};

exports.getLoanOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLoans,
      activeLoans,
      overdueLoans,
      todayLoans,
      todayReturns
    ] = await Promise.all([
      Loan.count(),
      Loan.count({ where: { status: 'ACTIVE' } }),
      Loan.count({
        where: {
          status: 'ACTIVE',
          due_date: { [Op.lt]: new Date() }
        }
      }),
      Loan.count({
        where: {
          created_at: {
            [Op.gte]: today
          }
        }
      }),
      Loan.count({
        where: {
          return_date: {
            [Op.gte]: today
          }
        }
      })
    ]);

    res.json({
      total_loans: totalLoans,
      active_loans: activeLoans,
      overdue_loans: overdueLoans,
      loans_today: todayLoans,
      returns_today: todayReturns
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching loan overview statistics',
      error: error.message
    });
  }
};