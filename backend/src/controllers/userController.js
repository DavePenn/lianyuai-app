const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { username, password, email } = req.body;
  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    return next(new AppError('用户名已存在', 400));
  }
  const newUser = await User.create(username, password, email);

  const token = signToken(newUser.id);

  res.status(201).json({
    success: true,
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError('请输入用户名和密码', 400));
  }

  const user = await User.findByUsername(username);
  if (!user || !(await User.comparePassword(password, user.password_hash))) {
    return next(new AppError('用户名或密码错误', 401));
  }

  const token = signToken(user.id);

  res.status(200).json({
    success: true,
    token
  });
});