const puppeteer = require('puppeteer');
const { strencode2 } = require('./m2_node');

// 浏览器池配置
const BROWSER_POOL = {
    maxInstances: 1, // 最大实例数改为1
    idleTimeout: 60000, // 增加空闲超时时间到60秒
    instances: [], // 浏览器实例池
    lastUsed: new Map(), // 记录最后使用时间
};

/**
 * 获取或创建浏览器实例
 * @returns {Promise<Object>} - 浏览器实例
 */
async function getBrowserInstance() {
    const now = Date.now();
    
    // 清理空闲过期的实例
    for (let i = BROWSER_POOL.instances.length - 1; i >= 0; i--) {
        const instance = BROWSER_POOL.instances[i];
        const lastUsed = BROWSER_POOL.lastUsed.get(instance);
        if (now - lastUsed > BROWSER_POOL.idleTimeout) {
            await instance.close();
            BROWSER_POOL.instances.splice(i, 1);
            BROWSER_POOL.lastUsed.delete(instance);
        }
    }
    
    // 查找可用的实例
    for (const instance of BROWSER_POOL.instances) {
        if (!BROWSER_POOL.lastUsed.get(instance)) {
            BROWSER_POOL.lastUsed.set(instance, now);
            return instance;
        }
    }
    
    // 如果池未满，创建新实例
    if (BROWSER_POOL.instances.length < BROWSER_POOL.maxInstances) {
        const browser = await puppeteer.launch(getDefaultBrowserConfig());
        BROWSER_POOL.instances.push(browser);
        BROWSER_POOL.lastUsed.set(browser, now);
        return browser;
    }
    
    // 如果池已满，等待可用实例
    return new Promise((resolve) => {
        const checkInterval = setInterval(async () => {
            for (const instance of BROWSER_POOL.instances) {
                if (!BROWSER_POOL.lastUsed.get(instance)) {
                    clearInterval(checkInterval);
                    BROWSER_POOL.lastUsed.set(instance, now);
                    resolve(instance);
                    return;
                }
            }
        }, 100);
    });
}

/**
 * 释放浏览器实例
 * @param {Object} browser - 浏览器实例
 */
function releaseBrowserInstance(browser) {
    BROWSER_POOL.lastUsed.set(browser, null);
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
 * 获取默认浏览器配置
 * @returns {Object} - 默认浏览器配置
 */
function getDefaultBrowserConfig() {
    const isLinux = process.platform === 'linux';
    return {
        headless: true,
        ...(isLinux ? { executablePath: '/usr/bin/google-chrome' } : {}),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
            '--disable-extensions',
            '--disable-notifications',
            '--disable-popup-blocking',
            '--disable-infobars',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials'
        ]
    };
}

/**
 * 从视频页面URL提取视频链接
 * @param {string} videoUrl - 视频页面URL
 * @param {Object} options - 配置选项
 * @param {number} options.timeout - 请求超时时间（毫秒）
 * @param {boolean} options.verbose - 是否输出详细日志
 * @returns {Promise<{success: boolean, videoUrl: string|null, error: string|null}>} - 包含提取结果的对象
 */
async function getVideoUrl(videoUrl, options = {}) {
    const {
        timeout = 15000,
        verbose = true
    } = options;

    let browser = null;
    let page = null;
    
    try {
        verbose && console.log(`开始获取视频页面内容: ${videoUrl}`);
        
        // 从池中获取浏览器实例
        browser = await getBrowserInstance();
        page = await browser.newPage();
        
        // 设置页面超时
        page.setDefaultTimeout(timeout);
        
        // 设置请求拦截，只加载必要的资源
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
                request.abort();
            } else {
                request.continue();
            }
        });
        
        // 设置请求头
        await page.setExtraHTTPHeaders({
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
        });
        
        // 访问页面，使用更快的等待策略
        await page.goto(videoUrl, {
            waitUntil: 'domcontentloaded',
            timeout: timeout
        });
        
        // 获取页面内容
        const pageContent = await page.content();
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
    } finally {
        if (page) {
            await page.close();
        }
        if (browser) {
            releaseBrowserInstance(browser);
        }
    }
}

module.exports = {
    getVideoUrl,
    extractVideoUrl
};