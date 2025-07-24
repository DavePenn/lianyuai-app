const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
// const {OAuth2Client} = require('google-auth-library'); // 临时注释以避免Node.js 12兼容性问题

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
  const { username, email, password } = req.body;
  const loginIdentifier = email || username; // 优先使用邮箱，兼容用户名

  if (!loginIdentifier || !password) {
    return next(new AppError('请输入邮箱/用户名和密码', 400));
  }

  const user = await User.findByUsername(loginIdentifier);
  if (!user || !(await User.comparePassword(password, user.password_hash))) {
    return next(new AppError('邮箱/用户名或密码错误', 401));
  }

  const token = signToken(user.id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

exports.googleAuth = catchAsync(async (req, res, next) => {
  // 临时禁用Google OAuth功能以避免Node.js 12兼容性问题
  return next(new AppError('Google登录功能暂时不可用', 503));
});