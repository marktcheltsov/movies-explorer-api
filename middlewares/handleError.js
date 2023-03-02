const handleError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errMessage = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;

  res.status(err.statusCode).json({ message: errMessage, status: statusCode });
  next();
};

module.exports = {
  handleError,
};
