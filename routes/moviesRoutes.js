const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const { saveMovie, deleteMovie, getMovies } = require('../controllers/movie');

router.get('/', getMovies);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().uri(),
    trailerLink: Joi.string().required().uri(),
    thumbnail: Joi.string().required().uri(),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), saveMovie);

router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().hex().length(24),
  }),
}), deleteMovie);

const moviesRouter = router;
module.exports = moviesRouter;
