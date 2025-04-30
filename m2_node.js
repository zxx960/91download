/**
 * m2.js的Node.js版本
 * 提取自原始混淆代码中的strencode2函数
 */

/**
 * 字符串解码函数
 * @param {string} encodedString - 需要解码的字符串
 * @returns {string} - 解码后的字符串
 */
function strencode2(encodedString) {
  // 直接使用decodeURIComponent替代unescape以正确处理UTF-8编码
  try {
    return decodeURIComponent(encodedString.replace(/\+/g, ' '));
  } catch (e) {
    // 如果解码失败，尝试使用传统的unescape方法
    return unescape(encodedString);
  }
}

// 为了兼容性保留unescape函数实现
if (typeof unescape !== 'function') {
  global.unescape = function(str) {
    // 这是一个简化版的unescape实现，主要用于后备处理
    return str.replace(/%([0-9A-F]{2})/gi, function(match, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
  };
}

// 导出函数供其他模块使用
module.exports = {
  strencode2
};