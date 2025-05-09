const { Loan, Book, User } = require('../models');
const { Op } = require('sequelize');

exports.createLoan = async (req, res) => {
  try {
    const { book_id, user_id, due_date } = req.body;

    const book = await Book.findByPk(book_id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({ message: 'No copies available for loan' });
    }

    const user = await User.findByPk(user_id || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const loan = await Loan.create({
      user_id: user.id,
      book_id,
      due_date,
      status: 'ACTIVE'
    });

    const loanWithDetails = await Loan.findByPk(loan.id, {
      include: [
        { model: Book, as: 'book', attributes: ['title', 'author'] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ]
    });

    res.status(201).json(loanWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error creating loan', error: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { loan_id } = req.body;
    const loan = await Loan.findByPk(loan_id, {
      include: [{ model: Book, as: 'book' }]
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status === 'RETURNED') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    loan.return_date = new Date();
    loan.status = 'RETURNED';
    await loan.save();

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error returning book', error: error.message });
  }
};

exports.getUserLoans = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const loans = await Loan.findAll({
      where: { user_id: userId },
      include: [
        { model: Book, as: 'book', attributes: ['title', 'author'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(loans);
  } catch (error) {
    res.status (500).json({ message: 'Error fetching loans', error: error.message });
  }
};

exports.getOverdueLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: {
        status: 'ACTIVE',
        due_date: { [Op.lt]: new Date() }
      },
      include: [
        { model: Book, as: 'book', attributes: ['title', 'author'] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ]
    });

    const overdueLoans = loans.map(loan => ({
      id: loan.id,
      user: loan.user,
      book: loan.book,
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      days_overdue: Math.ceil((new Date() - new Date(loan.due_date)) / (1000 * 60 * 60 * 24))
    }));

    res.json(overdueLoans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overdue loans', error: error.message });
  }
};

exports.extendLoan = async (req, res) => {
  try {
    const { loan_id, extension_days } = req.body;
    const loan = await Loan.findByPk(loan_id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Can only extend active loans' });
    }

    if (loan.extensions_count >= 2) {
      return res.status(400).json({ message: 'Maximum extensions reached' });
    }

    const newDueDate = new Date(loan.due_date);
    newDueDate.setDate(newDueDate.getDate() + extension_days);

    await loan.update({
      due_date: newDueDate,
      extensions_count: loan.extensions_count + 1
    });

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error extending loan', error: error.message });
  }
};