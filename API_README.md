# 视频链接提取器 API

这个API模块提供了从特定网站提取视频链接的功能，支持自定义配置和代理设置。

## 安装依赖

确保已安装所需依赖：

```bash
npm install axios
```

## API 使用方法

### 基本用法

```javascript
const { getVideoUrl } = require('./videoExtractor');

// 使用默认配置
getVideoUrl('https://www.91porn.com/view_video.php?viewkey=1566226242')
  .then(result => {
    if (result.success) {
      console.log('视频链接:', result.videoUrl);
    } else {
      console.log('提取失败:', result.error);
    }
  })
  .catch(error => {
    console.error('请求出错:', error.message);
  });
```

### 自定义配置

```javascript
const { getVideoUrl } = require('./videoExtractor');

// 自定义配置选项
const options = {
  // 请求超时时间（毫秒）
  timeout: 30000,
  // 是否使用代理
  useProxy: true,
  // 代理配置
  proxy: {
    host: '127.0.0.1',
    port: 7890 // 常见的代理端口，根据你的代理软件调整
  },
  // 自定义请求头（可选）
  headers: {
    // 可以添加自定义cookie等
    // 'cookie': '你的cookie'
  },
  // 是否输出详细日志
  verbose: true
};

getVideoUrl('https://www.91porn.com/view_video.php?viewkey=1566226242', options)
  .then(result => {
    if (result.success) {
      console.log('视频链接:', result.videoUrl);
    } else {
      console.log('提取失败:', result.error);
    }
  });
```

## API 参考

### getVideoUrl(videoUrl, options)

从视频页面URL提取视频链接。

**参数：**

- `videoUrl` (string): 视频页面URL
- `options` (object, 可选): 配置选项
  - `timeout` (number): 请求超时时间（毫秒），默认30000
  - `useProxy` (boolean): 是否使用代理，默认true
  - `proxy` (object): 代理配置
    - `host` (string): 代理主机，默认'127.0.0.1'
    - `port` (number): 代理端口，默认7890
  - `headers` (object): 自定义请求头
  - `verbose` (boolean): 是否输出详细日志，默认true

**返回值：**

返回一个Promise，解析为包含以下属性的对象：
- `success` (boolean): 是否成功提取视频链接
- `videoUrl` (string|null): 提取到的视频链接，如果失败则为null
- `error` (string|null): 错误信息，如果成功则为null

### extractVideoUrl(pageContent, verbose)

从HTML内容中提取视频链接。

**参数：**

- `pageContent` (string): 网页内容
- `verbose` (boolean, 可选): 是否输出详细日志，默认true

**返回值：**

- (string|null): 提取到的视频链接，如果失败则返回null

### createAxiosInstance(options)

创建一个配置了代理的axios实例。

**参数：**

- `options` (object, 可选): 配置选项
  - `timeout` (number): 请求超时时间（毫秒），默认30000
  - `useProxy` (boolean): 是否使用代理，默认true
  - `proxy` (object): 代理配置
    - `host` (string): 代理主机，默认'127.0.0.1'
    - `port` (number): 代理端口，默认7890

**返回值：**

- (object): 配置好的axios实例

### getDefaultHeaders()

获取默认请求头。

**返回值：**

- (object): 默认请求头

## 示例

查看 `example.js` 文件获取完整示例。

## 常见问题

### 代理设置

由于某些网站可能有访问限制，建议配置代理以确保正常访问：

1. 将 `useProxy` 设置为 `true`
2. 配置 `proxy.host` 和 `proxy.port` 为你的代理服务器地址和端口
3. 常见的代理软件默认端口：
   - Clash: 7890
   - V2Ray: 10809
   - Shadowsocks: 1080