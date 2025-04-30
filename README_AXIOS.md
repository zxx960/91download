# 视频链接提取器 - Axios 版本

## 简介

这是一个使用 Axios 替代 Puppeteer 实现的视频链接提取工具。相比于 Puppeteer 版本，Axios 版本更加轻量级，不需要启动浏览器，资源占用更少，但在某些情况下可能需要配置代理才能正常访问目标网站。

## 功能特点

- 使用 Axios 发送 HTTP 请求获取页面内容
- 支持自动重试和超时设置
- 支持命令行参数指定视频 URL
- 支持配置 HTTP 代理
- 可保存响应内容到文件进行调试
- 多种视频链接提取方法

## 使用方法

### 基本使用

```bash
node server.js
```

### 指定视频 URL

```bash
node server.js https://example.com/view_video.php?viewkey=123456789
```

## 配置说明

在 `server.js` 文件中，可以修改 `config` 对象来自定义配置：

```javascript
const config = {
    // 默认视频URL，可以通过命令行参数覆盖
    videoUrl: 'https://www.91porn.com/view_video.php?viewkey=1566226242',
    // 请求超时时间（毫秒）
    timeout: 30000,
    // 最大重试次数
    maxRetries: 3,
    // 是否保存响应内容到文件（用于调试）
    saveResponseToFile: true,
    // 响应内容保存路径
    responseFilePath: './response.html',
    // 是否使用代理
    useProxy: true,
    // 代理配置
    proxy: {
        host: '127.0.0.1',
        port: 7890 // 常见的代理端口，如果使用其他代理软件，请修改为对应端口
    }
};
```

### 代理设置

由于某些网站可能有访问限制，建议配置代理以确保正常访问：

1. 将 `useProxy` 设置为 `true`
2. 配置 `proxy.host` 和 `proxy.port` 为你的代理服务器地址和端口
3. 常见的代理软件默认端口：
   - Clash: 7890
   - V2Ray: 10809
   - Shadowsocks: 1080

## 故障排除

### 连接超时

如果遇到 `connect ETIMEDOUT` 错误，可能是由于：

1. 目标网站不可访问或被屏蔽
2. 需要配置代理
3. 代理服务器未正常运行

解决方法：
- 确认代理软件已启动并正常运行
- 检查代理端口配置是否正确
- 尝试使用其他代理服务器

### 无法提取视频链接

如果脚本运行成功但无法提取视频链接，可能是由于：

1. 目标网站结构已变更
2. 需要登录或Cookie才能访问内容
3. 视频内容使用了不同的加密方式

解决方法：
- 检查 `response.html` 文件查看实际响应内容
- 尝试添加必要的Cookie到请求头
- 更新提取逻辑以适应新的网站结构

## 与Puppeteer版本的区别

| 特性 | Axios版本 | Puppeteer版本 |
|------|----------|---------------|
| 资源占用 | 低 | 高 |
| 执行速度 | 快 | 慢 |
| 浏览器渲染 | 不支持 | 支持 |
| JavaScript执行 | 不支持 | 支持 |
| 代理支持 | 需手动配置 | 内置支持 |
| 适用场景 | 简单页面内容获取 | 复杂交互和渲染 |