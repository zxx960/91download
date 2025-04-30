const puppeteer = require('puppeteer');
const { strencode2 } = require('./m2_node');
const videoUrl = 'https://www.91porn.com/view_video.php?viewkey=1566226242';

(async () => {
    const browser = await puppeteer.launch({
        headless: true, // 设置为 false 可以看到浏览器运行过程，方便调试
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // 这些参数有时能避免某些问题
    });

    const page = await browser.newPage();
    
    // 设置请求头
    await page.setExtraHTTPHeaders({
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-store, no-cache, must-revalidate',
        'cookie': 'CLIPSHARE=5a32277c7a0078388c2f43903a65ef98; ga=f40cov7frtAjb3NkHlW31PPhh%2BZiqiVi%2FGNaZ2Rm23Xpx%2FSCuQ7uzw; _ga=GA1.1.598566746.1745950925; _ga_K5S02BRGF0=GS1.1.1745954691.2.1.1745954692.0.0.0; cf_clearance=1JZTr3KqcY0f0cISU.T060dq7Uv7u4MKh_IOpqYCm.A-1745954691-1.2.1.1-gkETbbyzdtJJW45gjW_rOSgG7pZx6r6jCBj.p_Qb77EZnnJVJzhLWywxBng7vMQIZvii_InYnk.dNW.3s.O1PDfZBZk3tMstBKCJqD2gQrgblAVFXHTdPl5dawUBlu3DE4DYsRLCns.vYlJTsvItktOtX6gqPvdQ1OZ52zMF8oyD4T1szKKtwCPPbQYCMy7TTEWvbDZqYJwsBmuJwhrkTkS9.Xm99nZgiekLo87fSaO7VQeVAQm1xFDMTTtMYbhDba1dOGRTabLXVTwyKBTQLiTvBMAFKtmoFpnE9zuB5_w4EycBsAxdotC65NSjFlKb.XUPpxYBdRrV4rZyz2VMMO8Q6LEgdEj69GfJqgQCH8w',
        'priority': 'u=0, i',
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

    // 跳转到视频页面
    await page.goto(videoUrl, { waitUntil: 'networkidle2' });

    // 等待2s
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 获取页面源码
    const pageContent = await page.content();
    var jm = strencode2(pageContent.split("document.write(strencode2(\"")[1].split("\"")[0]);
    console.log(pageContent.split("document.write(strencode2(\"")[1].split("\"")[0]) 
    var videoSrc = jm.split("<source src='")[1].split("'")[0];
    if (videoSrc) {
        console.log('视频链接:', videoSrc);
    } else {
        console.log('未能提取视频链接');
    }

    // 关闭浏览器
    await browser.close();
})();
