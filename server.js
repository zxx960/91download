const axios = require('axios');
const { strencode2 } = require('./m2_node');

// 可配置参数
const config = {
    // 默认视频URL，可以通过命令行参数覆盖
    videoUrl: 'https://www.91porn.com/view_video.php?viewkey=1566226242',
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

// 从命令行参数获取视频URL（如果提供）
if (process.argv.length > 2) {
    config.videoUrl = process.argv[2];
    console.log(`使用命令行提供的URL: ${config.videoUrl}`);
}

// 创建一个超时设置的axios实例
const axiosInstance = axios.create({
    timeout: config.timeout,
    maxRedirects: 5,
    validateStatus: function (status) {
        return status >= 200 && status < 300;
    },
    // 如果启用代理，添加代理配置
    ...(config.useProxy && {
        proxy: {
            host: config.proxy.host,
            port: config.proxy.port,
            protocol: 'http'
        }
    })
});





// 从HTML内容中提取视频链接
function extractVideoUrl(pageContent) {
    if (!pageContent) {
        console.error('页面内容为空');
        return null;
    }
    
    // 尝试使用strencode2解码方法提取
    if (pageContent.includes('document.write(strencode2("')) {
        console.log('找到加密的视频信息，使用strencode2方法解析...');
        try {
            const encodedPart = pageContent.split("document.write(strencode2(\"")[1]?.split("\"")[0];
            if (!encodedPart) {
                console.error('无法找到加密部分');
                return null;
            }
            
            const jm = strencode2(encodedPart);
            const videoSrc = jm.split("<source src='")[1]?.split("'")[0];
            return videoSrc;
        } catch (error) {
            console.error(`解析加密内容时出错: ${error.message}`);
            return null;
        }
    }
    
    // 尝试直接从页面中查找m3u8链接
    console.log('尝试直接查找m3u8链接...');
    const m3u8Pattern = /https?:\/\/[^\s<>"']+?\.m3u8[^\s<>"']*/g;
    const matches = pageContent.match(m3u8Pattern);
    
    if (matches && matches.length > 0) {
        console.log(`找到 ${matches.length} 个m3u8链接`);
        return matches[0]; // 返回第一个匹配的链接
    }
    
    return null;
}

// 主函数
(async () => {
    try {
        // 设置请求头
        const headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'cache-control': 'no-store, no-cache, must-revalidate',
            // 'cookie': '在这里添加你的cookie', // 如果需要，可以添加cookie
            'referer': 'https://www.91porn.com/index.php',
            'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
        };

        console.log(`开始获取视频页面内容: ${config.videoUrl}`);
        
        // 直接使用axios实例发送请求
        const response = await axiosInstance.get(config.videoUrl, { headers });
        const pageContent = response.data;
        console.log('成功获取页面内容');
        

        
        // 提取视频链接
        const videoSrc = extractVideoUrl(pageContent);
        
        if (videoSrc) {
            console.log('成功提取视频链接:');
            console.log(videoSrc);
        } else {
            console.log('未能提取视频链接');
        }
    } catch (error) {
        console.error('获取视频链接最终失败:', error.message);
    }
})();
