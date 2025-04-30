# m2.js Node.js 版本

这个项目将原始的浏览器端 m2.js 文件改造成了可以在 Node.js 环境中运行的模块。

## 文件说明

- `m2_node.js`: 从原始混淆代码中提取的核心功能，添加了 Node.js 兼容性
- `example.js`: 使用示例

## 使用方法

1. 导入模块：

```javascript
const { strencode2 } = require('./m2_node');
```

2. 使用解码函数：

```javascript
const decodedString = strencode2(encodedString);
```

## 运行示例

```bash
node example.js
```

## 功能说明

`strencode2` 函数用于解码 URL 编码的字符串，它使用 `unescape` 函数进行解码。由于 Node.js 已弃用原生的 `unescape` 函数，模块内部实现了一个兼容版本。

## 与原始 m2.js 的区别

1. 移除了浏览器相关的代码
2. 移除了混淆代码
3. 添加了 Node.js 兼容层
4. 使用 `module.exports` 导出函数