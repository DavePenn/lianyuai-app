/**
 * 文件上传路由
 * 处理文件上传相关的路由
 */

const express = require('express');
const router = express.Router();
const {
    uploadSingle,
    uploadMultiple,
    handleUpload,
    deleteFile,
    getFileInfo,
    downloadFile
} = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

// 所有上传路由都需要认证
router.use(authMiddleware);

// 单文件上传
router.post('/single', uploadSingle, handleUpload);

// 多文件上传
router.post('/multiple', uploadMultiple, handleUpload);

// 通用上传接口（兼容前端调用）
router.post('/', uploadSingle, handleUpload);

// 文件管理接口
router.get('/:type/:filename/info', getFileInfo);
router.get('/:type/:filename/download', downloadFile);
router.delete('/:type/:filename', deleteFile);

// 静态文件服务（用于直接访问上传的文件）
const path = require('path');
const uploadDir = path.join(__dirname, '../../uploads');
router.use('/files', express.static(uploadDir));

module.exports = router;