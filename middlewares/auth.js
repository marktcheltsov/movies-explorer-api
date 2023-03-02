const { NODE_ENV, JWT_SECRET } = process.env;

const jwt = require('jsonwebtoken');

const WrongData = require('../errors/wrong-data-err');

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    const err = new WrongData('Необходима авторизация');
    next(err);
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (e) {
    const err = new WrongData('Необходима авторизация');
    next(err);
  }
  req.user = payload;
  next();
};

module.exports = {
  auth,
};
