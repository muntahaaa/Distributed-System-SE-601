const { User } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

const LOAN_SERVICE_URL = process.env.LOAN_SERVICE_URL || 'http://localhost:5003';

exports.getActiveUsers = async (req, res) => {
    try {
      // Get loan statistics from Loan service
      const loanStatsResponse = await axios.get(`${LOAN_SERVICE_URL}/api/loans/stats/user-loans`, {
        headers: { Authorization: req.headers.authorization }
      });

      const activeUserIds = loanStatsResponse.data
        .filter(stat => stat.loan_count > 1)
        .map(stat => stat.user_id);

      if (activeUserIds.length === 0) {
        return res.json([]);
      }

      // Get user details for active users
      const activeUsers = await User.findAll({
        where: {
          id: { [Op.in]: activeUserIds }
        },
        attributes: ['id', 'name', 'email', 'role'],
        order: [['created_at', 'DESC']]
      });

      // Combine user details with loan counts
      const usersWithLoanCounts = activeUsers.map(user => ({
        ...user.toJSON(),
        loan_count: loanStatsResponse.data.find(stat => stat.user_id === user.id).loan_count
      }));
  
      res.json(usersWithLoanCounts);
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ message: 'Error fetching active users', error: error.message });
    }
  };

  exports.getUserCount = async (req, res) => {
    try {
      const count = await User.count();
      res.json({ count });
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ message: 'Error fetching user count', error: error.message });
    }
  };
