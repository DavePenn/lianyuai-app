/**
 * 文件上传控制器
 * 处理文件上传相关功能
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { type = 'general' } = req.body;
        const typeDir = path.join(uploadDir, type);
        
        // 确保类型目录存在
        if (!fs.existsSync(typeDir)) {
            fs.mkdirSync(typeDir, { recursive: true });
        }
        
        cb(null, typeDir);
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    const { type = 'general' } = req.body;
    
    // 根据类型设置允许的文件类型
    const allowedTypes = {
        image: /\.(jpg|jpeg|png|gif|webp)$/i,
        audio: /\.(mp3|wav|ogg|m4a)$/i,
        video: /\.(mp4|avi|mov|wmv|flv)$/i,
        document: /\.(pdf|doc|docx|txt|rtf)$/i,
        general: /\.(jpg|jpeg|png|gif|webp|mp3|wav|ogg|m4a|mp4|avi|mov|pdf|doc|docx|txt)$/i
    };
    
    const pattern = allowedTypes[type] || allowedTypes.general;
    
    if (pattern.test(file.originalname)) {
        cb(null, true);
    } else {
        cb(new AppError(`不支持的文件类型: ${file.originalname}`, 400), false);
    }
};

// 配置multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
        files: 5 // 最多5个文件
    }
});

// 单文件上传
exports.uploadSingle = upload.single('file');

// 多文件上传
exports.uploadMultiple = upload.array('files', 5);

// 处理文件上传
exports.handleUpload = catchAsync(async (req, res, next) => {
    if (!req.file && !req.files) {
        return next(new AppError('请选择要上传的文件', 400));
    }
    
    const { type = 'general' } = req.body;
    const userId = req.user ? req.user.id : null;
    
    // 处理单文件上传
    if (req.file) {
        const fileInfo = {
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            type: type,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            url: `/uploads/${type}/${req.file.filename}`
        };
        
        return res.status(200).json({
            status: 'success',
            message: '文件上传成功',
            data: {
                file: fileInfo
            }
        });
    }
    
    // 处理多文件上传
    if (req.files && req.files.length > 0) {
        const filesInfo = req.files.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            type: type,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            url: `/uploads/${type}/${file.filename}`
        }));
        
        return res.status(200).json({
            status: 'success',
            message: `成功上传 ${req.files.length} 个文件`,
            data: {
                files: filesInfo
            }
        });
    }
});

// 删除文件
exports.deleteFile = catchAsync(async (req, res, next) => {
    const { filename, type = 'general' } = req.params;
    
    if (!filename) {
        return next(new AppError('请提供文件名', 400));
    }
    
    const filePath = path.join(uploadDir, type, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        return next(new AppError('文件不存在', 404));
    }
    
    try {
        // 删除文件
        fs.unlinkSync(filePath);
        
        res.status(200).json({
            status: 'success',
            message: '文件删除成功'
        });
    } catch (error) {
        console.error('文件删除失败:', error);
        return next(new AppError('文件删除失败', 500));
    }
});

// 获取文件信息
exports.getFileInfo = catchAsync(async (req, res, next) => {
    const { filename, type = 'general' } = req.params;
    
    if (!filename) {
        return next(new AppError('请提供文件名', 400));
    }
    
    const filePath = path.join(uploadDir, type, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        return next(new AppError('文件不存在', 404));
    }
    
    try {
        const stats = fs.statSync(filePath);
        
        const fileInfo = {
            filename: filename,
            type: type,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            url: `/uploads/${type}/${filename}`
        };
        
        res.status(200).json({
            status: 'success',
            data: {
                file: fileInfo
            }
        });
    } catch (error) {
        console.error('获取文件信息失败:', error);
        return next(new AppError('获取文件信息失败', 500));
    }
});

// 下载文件
exports.downloadFile = catchAsync(async (req, res, next) => {
    const { filename, type = 'general' } = req.params;
    
    if (!filename) {
        return next(new AppError('请提供文件名', 400));
    }
    
    const filePath = path.join(uploadDir, type, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        return next(new AppError('文件不存在', 404));
    }
    
    try {
        // 设置响应头
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // 发送文件
        res.sendFile(filePath);
    } catch (error) {
        console.error('文件下载失败:', error);
        return next(new AppError('文件下载失败', 500));
    }
});

module.exports = {
    uploadSingle: exports.uploadSingle,
    uploadMultiple: exports.uploadMultiple,
    handleUpload: exports.handleUpload,
    deleteFile: exports.deleteFile,
    getFileInfo: exports.getFileInfo,
    downloadFile: exports.downloadFile
};