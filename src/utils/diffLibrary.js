/**
 * diff 库封装 - 适配 myersDiff 的输出格式
 */
var diff = require('diff')

var DiffLibrary = function() {
  this.INSERT = 'insert'
  this.DELETE = 'delete'
  this.EQUAL = 'equal'
  this.MODIFY = 'modify'
}

DiffLibrary.prototype.diff = function(oldText, newText) {
  var self = this
  
  // 标准化换行符
  oldText = oldText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  newText = newText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  if (oldText === newText) {
    return [{ type: this.EQUAL, value: oldText }]
  }
  
  // 使用 diffLines 获取行级别的差异
  var lineDiff = diff.diffLines(oldText, newText)
  var result = []
  
  lineDiff.forEach(function(part) {
    // 分割成行，移除末尾空行
    var lines = part.value.split(/\n/)
    if (lines[lines.length - 1] === '') lines.pop()
    
    if (lines.length === 0) return
    
    // 判断类型
    if (part.added) {
      // 新增的行
      lines.forEach(function(line) {
        result.push({ type: self.INSERT, value: line })
      })
    } else if (part.removed) {
      // 删除的行
      lines.forEach(function(line) {
        result.push({ type: self.DELETE, value: line })
      })
    } else {
      // 相等的行
      lines.forEach(function(line) {
        result.push({ type: self.EQUAL, value: line })
      })
    }
  })
  
  // 检测修改（连续删除后紧跟新增）
  var merged = []
  for (var i = 0; i < result.length; i++) {
    var current = result[i]
    var next = result[i + 1]
    
    if (current.type === self.DELETE && next && next.type === self.INSERT) {
      // 合并为修改
      merged.push({
        type: self.MODIFY,
        oldValue: current.value,
        newValue: next.value
      })
      i++ // 跳过下一个
    } else {
      merged.push(current)
    }
  }
  
  return merged
}

module.exports = new DiffLibrary()
