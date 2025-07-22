const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const {OAuth2Client} = require('google-auth-library');

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

exports.googleAuth = catchAsync(async (req, res, next) => {
  const { credential } = req.body;

  if (!credential) {
    return next(new AppError('缺少Google凭证', 400));
  }

  try {
    // 初始化Google OAuth客户端
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // 验证Google凭证
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return next(new AppError('Google账户中缺少邮箱信息', 400));
    }

    // 检查用户是否已存在
    let user = await User.findByEmail(email);
    
    if (!user) {
      // 创建新用户
      const username = email.split('@')[0]; // 使用邮箱前缀作为用户名
      user = await User.createWithGoogle({
        username,
        email,
        name,
        googleId,
        avatar: picture
      });
    } else {
      // 更新Google ID（如果还没有关联）
      if (!user.google_id) {
        await User.updateGoogleId(user.id, googleId);
      }
    }

    const token = signToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Google OAuth验证失败:', error);
    return next(new AppError('Google登录验证失败', 401));
  }
});