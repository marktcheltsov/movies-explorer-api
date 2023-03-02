const mongoose = require('mongoose');

const { default: isEmail } = require('validator/lib/isEmail');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => isEmail(email),
      message: (email) => `${email} не прошел валидацию`,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, { bufferCommands: false });

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
