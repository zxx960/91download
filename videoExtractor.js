const axios = require('axios');
const { strencode2 } = require('./m2_node');

/**
 * 创建一个配置了代理的axios实例
 * @param {Object} options - 配置选项
 * @param {number} options.timeout - 请求超时时间（毫秒）
 * @param {boolean} options.useProxy - 是否使用代理
 * @param {Object} options.proxy - 代理配置
 * @param {string} options.proxy.host - 代理主机
 * @param {number} options.proxy.port - 代理端口
 * @returns {Object} - 配置好的axios实例
 */
function createAxiosInstance(options = {}) {
    const {
        timeout = 30000,
        useProxy = true,
        proxy = {
            host: '127.0.0.1',
            port: 7890
        }
    } = options;

    return axios.create({
        timeout,
        maxRedirects: 5,
        validateStatus: function (status) {
            return status >= 200 && status < 300;
        },
        // 如果启用代理，添加代理配置
        ...(useProxy && {
            proxy: {
                host: proxy.host,
                port: proxy.port,
                protocol: 'http'
            }
        })
    });
}

/**
 * 从HTML内容中提取视频链接
 * @param {string} pageContent - 网页内容
 * @param {boolean} verbose - 是否输出详细日志
 * @returns {string|null} - 提取到的视频链接，如果失败则返回null
 */
function extractVideoUrl(pageContent, verbose = true) {
    if (!pageContent) {
        verbose && console.error('页面内容为空');
        return null;
    }
    
    // 尝试使用strencode2解码方法提取
    if (pageContent.includes('document.write(strencode2("')) {
        verbose && console.log('找到加密的视频信息，使用strencode2方法解析...');
        try {
            const encodedPart = pageContent.split("document.write(strencode2(\"")[1]?.split("\"")[0];
            if (!encodedPart) {
                verbose && console.error('无法找到加密部分');
                return null;
            }
            
            const jm = strencode2(encodedPart);
            const videoSrc = jm.split("<source src='")[1]?.split("'")[0];
            return videoSrc;
        } catch (error) {
            verbose && console.error(`解析加密内容时出错: ${error.message}`);
            return null;
        }
    }
    
    // 尝试直接从页面中查找m3u8链接
    verbose && console.log('尝试直接查找m3u8链接...');
    const m3u8Pattern = /https?:\/\/[^\s<>"']+?\.m3u8[^\s<>"']*/g;
    const matches = pageContent.match(m3u8Pattern);
    
    if (matches && matches.length > 0) {
        verbose && console.log(`找到 ${matches.length} 个m3u8链接`);
        return matches[0]; // 返回第一个匹配的链接
    }
    
    return null;
}

/**
 * 获取默认请求头
 * @returns {Object} - 默认请求头
 */
function getDefaultHeaders() {
    return {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-store, no-cache, must-revalidate',
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
}

/**
 * 从视频页面URL提取视频链接
 * @param {string} videoUrl - 视频页面URL
 * @param {Object} options - 配置选项
 * @param {number} options.timeout - 请求超时时间（毫秒）
 * @param {boolean} options.useProxy - 是否使用代理
 * @param {Object} options.proxy - 代理配置
 * @param {string} options.proxy.host - 代理主机
 * @param {number} options.proxy.port - 代理端口
 * @param {Object} options.headers - 自定义请求头
 * @param {boolean} options.verbose - 是否输出详细日志
 * @returns {Promise<{success: boolean, videoUrl: string|null, error: string|null}>} - 包含提取结果的对象
 */
async function getVideoUrl(videoUrl, options = {}) {
    const {
        timeout,
        useProxy,
        proxy,
        headers = {},
        verbose = true
    } = options;

    // 创建axios实例
    const axiosInstance = createAxiosInstance({ timeout, useProxy, proxy });
    
    // 合并默认请求头和自定义请求头
    const requestHeaders = { ...getDefaultHeaders(), ...headers };
    
    try {
        verbose && console.log(`开始获取视频页面内容: ${videoUrl}`);
        
        // 发送请求
        const response = await axiosInstance.get(videoUrl, { headers: requestHeaders });
        const pageContent = response.data;
        verbose && console.log('成功获取页面内容');
        
        // 提取视频链接
        const videoSrc = extractVideoUrl(pageContent, verbose);
        
        if (videoSrc) {
            verbose && console.log('成功提取视频链接:', videoSrc);
            return {
                success: true,
                videoUrl: videoSrc,
                error: null
            };
        } else {
            verbose && console.log('未能提取视频链接');
            return {
                success: false,
                videoUrl: null,
                error: '未能从页面提取视频链接'
            };
        }
    } catch (error) {
        verbose && console.error('获取视频链接失败:', error.message);
        return {
            success: false,
            videoUrl: null,
            error: error.message
        };
    }
}

module.exports = {
    getVideoUrl,
    extractVideoUrl,
    createAxiosInstance,
    getDefaultHeaders
};