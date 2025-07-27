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

// 获取用户资料
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('用户不存在', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        gender: user.gender,
        birth_date: user.birth_date,
        province: user.province,
        city: user.city,
        relationship_status: user.relationship_status,
        interests: user.interests,
        contact: user.contact,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }
  });
});

// 更新用户资料
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { username, email, bio, gender, birth_date, province, city, relationship_status, interests, contact } = req.body;
  const userId = req.user.id;

  // 检查用户名是否已被其他用户使用
  if (username) {
    const existingUser = await User.findByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      return next(new AppError('用户名已被使用', 400));
    }
  }

  // 检查邮箱是否已被其他用户使用
  if (email) {
    const existingEmail = await User.findByEmail(email);
    if (existingEmail && existingEmail.id !== userId) {
      return next(new AppError('邮箱已被使用', 400));
    }
  }

  // 构建更新数据对象
  const updateData = {};
  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;
  if (bio !== undefined) updateData.bio = bio;
  if (gender !== undefined) updateData.gender = gender;
  if (birth_date !== undefined) updateData.birth_date = birth_date;
  if (province !== undefined) updateData.province = province;
  if (city !== undefined) updateData.city = city;
  if (relationship_status !== undefined) updateData.relationship_status = relationship_status;
  if (interests !== undefined) updateData.interests = interests;
  if (contact !== undefined) updateData.contact = contact;

  const updatedUser = await User.updateProfile(userId, updateData);
  if (!updatedUser) {
    return next(new AppError('更新失败', 400));
  }

  res.status(200).json({
    success: true,
    message: '资料更新成功',
    data: {
      user: updatedUser
    }
  });
});

// 修改密码
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('请提供当前密码、新密码和确认密码', 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError('新密码和确认密码不匹配', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('新密码长度至少为6位', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('用户不存在', 404));
  }

  // 验证当前密码
  if (!(await User.comparePassword(currentPassword, user.password_hash))) {
    return next(new AppError('当前密码错误', 401));
  }

  // 更新密码
  const success = await User.updatePassword(userId, newPassword);
  if (!success) {
    return next(new AppError('密码更新失败', 400));
  }

  res.status(200).json({
    success: true,
    message: '密码修改成功'
  });
});

// Token验证
exports.verifyToken = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('用户不存在', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Token验证成功',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    }
  });
});