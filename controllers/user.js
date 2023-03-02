const { NODE_ENV, JWT_SECRET } = process.env;

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err');
const ValidationErr = require('../errors/validation-err');
const IncomprehensibleErr = require('../errors/incomprehensible-err');
const WrongData = require('../errors/wrong-data-err');
const DataAuthErr = require('../errors/data-auth-err');

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new NotFoundError('Запрашиваемый пользователь не найден');
      return next(err);
    }
    return res.status(200).json(user);
  } catch (e) {
    if ((e.name === 'CastError') || (e.name === 'TypeError')) {
      console.error(e);
      const err = new ValidationErr('Переданы некорректные данные');
      return next(err);
    }
    console.error(e);
    const err = new IncomprehensibleErr('произошла ошибка');
    return next(err);
  }
};

const updateUser = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true },
    );
    if (!user) {
      const err = new NotFoundError('Запрашиваемый пользователь не найден');
      return next(err);
    }
    return res.status(200).json(user);
  } catch (e) {
    if (e.name === 'ValidationError') {
      console.log(e);
      const err = new ValidationErr('Переданы некорректные данные при обновлении');
      return next(err);
    }
    if (e.code === 11000) {
      const err = new DataAuthErr('пользователь с такой почтой уже есть');
      next(err);
    }
    console.error(e);
    const err = new IncomprehensibleErr('произошла ошибка');
    return next(err);
  }
};

const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
    }))
    .then((user) => res.send({
      name: user.name,
      email: user.email,
      id: user._id,
    }))
    .catch((e) => {
      if (e.name === 'ValidationError') {
        console.log(e);
        const err = new ValidationErr('Переданы некорректные данные при создани');
        next(err);
      }
      if (e.code === 11000) {
        const err = new DataAuthErr('пользователь с такой почтой уже есть');
        next(err);
      }
      console.error(e);
      const err = new IncomprehensibleErr('произошла ошибка');
      next(err);
    });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const err = new WrongData('Неправильные почта или пароль');
      return next(err);
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      const err = new WrongData('Неправильные почта или пароль');
      return next(err);
    }
    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      { expiresIn: '7d' },
    );
    return res.status(200).json({ jwt: token });
  } catch (e) {
    console.log(e);
    const err = new IncomprehensibleErr('произошла ошибка');
    return next(err);
  }
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  login,
};
