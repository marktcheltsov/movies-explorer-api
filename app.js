const express = require('express');
require('dotenv').config();

const { PORT = 3000, NODE_ENV, DATA_BASE } = process.env;

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const cors = require('cors');

const app = express();

const { createUser, login } = require('./controllers/user');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { auth } = require('./middlewares/auth');
const { handleError } = require('./middlewares/handleError');

const NotFoundError = require('./errors/not-found-err');

const userRouter = require('./routes/userRoutes');

const moviesRouter = require('./routes/moviesRoutes');

const allowedCors = ['http://diplomamarkuhaaa.nomoredomains.work', 'http://localhost:3000', 'https://diplomamarkuhaaa.nomoredomains.work'];

const corsOptions = {
  origin: allowedCors,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(requestLogger);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.use(auth);

app.use('/users', userRouter);
app.use('/movies', moviesRouter);

app.use('*', (req, res, next) => {
  const err = new NotFoundError('указан неправильный путь');
  next(err);
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  handleError(err, req, res, next);
});

mongoose.connect(NODE_ENV === 'production' ? DATA_BASE : 'mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
}, () => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
});
