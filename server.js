const express = require('express');
const cors = require('cors');
const { getVideoUrl } = require('./videoExtractor');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 可配置参数
const config = {
    // 请求超时时间（毫秒）
    timeout: 30000,
    // 是否使用代理（如果需要）
    useProxy: true, // 默认启用代理
    // 代理配置
    proxy: {
        host: '127.0.0.1',
        port: 7890 // 常见的代理端口，如果使用其他代理软件，请修改为对应端口
    }
};

// 中间件
app.use(express.json());
app.use(cors()); // 启用CORS支持跨域请求

// 首页路由
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: '视频链接提取API服务已启动',
        usage: {
            endpoint: '/api/extract',
            method: 'POST',
            body: { url: '视频页面URL' },
            example: 'curl -X POST -H "Content-Type: application/json" -d "{\"url\":\"https://www.91porn.com/view_video.php?viewkey=1566226242\"}" http://localhost:3000/api/extract'
        }
    });
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
            useProxy: config.useProxy,
            proxy: config.proxy,
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
