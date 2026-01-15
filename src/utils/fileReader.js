/**
 * 文件读取工具函数
 */

/**
 * 读取文本文件
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文件内容
 */
export function readFile(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader()

    reader.onload = function(e) {
      resolve(e.target.result)
    }

    reader.onerror = function(e) {
      var errorMessage = '未知错误'
      if (e.target.error) {
        errorMessage = e.target.error.message || '未知错误'
      }
      reject(new Error('文件读取失败: ' + errorMessage))
    }

    reader.readAsText(file)
  })
}

/**
 * 读取 JSON 文件
 * @param {File} file - 文件对象
 * @returns {Promise<object>} 解析后的 JSON 对象
 */
export function readJSON(file) {
  return new Promise(function(resolve, reject) {
    readFile(file)
      .then(function(content) {
        try {
          resolve(JSON.parse(content))
        } catch (error) {
          reject(new Error('JSON 解析失败: ' + error.message))
        }
      })
      .catch(reject)
  })
}
