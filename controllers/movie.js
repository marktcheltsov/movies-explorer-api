const Movie = require('../models/movies');

const NotFoundError = require('../errors/not-found-err');

const ValidationErr = require('../errors/validation-err');
const IncomprehensibleErr = require('../errors/incomprehensible-err');
const AccessErr = require('../errors/access-err');

const getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ owner: req.user._id });
    return res.status(200).json(movies);
  } catch (e) {
    console.error(e);
    const err = new IncomprehensibleErr('произошла ошибка');
    return next(err);
  }
};

const saveMovie = async (req, res, next) => {
  req.body.owner = req.user._id;
  try {
    const movie = await Movie.create(req.body);
    return res.status(200).json(movie);
  } catch (e) {
    if (e.name === 'ValidationError') {
      console.log(e);
      const err = new ValidationErr('Переданы некорректные данные при создании');
      return next(err);
    }
    console.log(e);
    const err = new IncomprehensibleErr('произошла ошибка');
    return next(err);
  }
};

const deleteMovie = async (req, res, next) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      const err = new NotFoundError('Запрашиваемый фильм не найден');
      return next(err);
    }
    if (movie.owner.toString() !== req.user._id) {
      const err = new AccessErr('у вас нет прав на это');
      return next(err);
    }
    const deletedMovie = await movie.remove();
    return res.status(200).json(deletedMovie);
  } catch (e) {
    if ((e.name === 'CastError') || (e.name === 'TypeError')) {
      console.error(e);
      const err = new ValidationErr('Переданы некорректные данные при удалении');
      return next(err);
    }
    console.error(e);
    const err = new IncomprehensibleErr('произошла ошибка');
    return next(err);
  }
};

module.exports = {
  saveMovie,
  deleteMovie,
  getMovies,
};
