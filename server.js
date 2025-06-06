const express = require('express');
// const cors = require('cors'); // 移除不需要的cors模块
const path = require('path');
const { getVideoUrl } = require('./videoExtractor');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 可配置参数
const config = {
    // 请求超时时间（毫秒）
    timeout: 15000 // 减少默认超时时间
};

// 中间件
app.use(express.json());
// 移除CORS配置，因为前后端在同一域名下
app.use('/', express.static(__dirname)); // 提供静态文件服务

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 视频链接提取API
app.post('/api/extract', async (req, res) => {
    try {
        // 验证请求参数
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                status: 'error',
                message: '缺少必要参数: url'
            });
        }
        
        // 验证URL格式
        if (!url.match(/^https?:\/\/.+/)) {
            return res.status(400).json({
                status: 'error',
                message: 'URL格式不正确'
            });
        }
        
        console.log(`接收到提取请求: ${url}`);
        
        // 调用视频提取函数
        const result = await getVideoUrl(url, {
            timeout: config.timeout,
            verbose: true
        });
        
        if (result.success) {
            return res.json({
                status: 'success',
                data: {
                    videoUrl: result.videoUrl
                }
            });
        } else {
            return res.status(404).json({
                status: 'error',
                message: result.error || '未能提取视频链接'
            });
        }
    } catch (error) {
        console.error('API错误:', error.message);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误',
            error: error.message
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器已启动，监听端口 ${PORT}`);
    console.log(`API文档: http://localhost:${PORT}/`);
});
