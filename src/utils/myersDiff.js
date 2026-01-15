/**
 * Myers Diff 算法实现（优化版）
 * 用于计算两个文本序列之间的最小编辑距离和差异
 */
function MyersDiff() {
  this.INSERT = 'insert'
  this.DELETE = 'delete'
  this.EQUAL = 'equal'
  this.MODIFY = 'modify'
}

/**
 * 计算两个文本之间的差异
 */
MyersDiff.prototype.diff = function(oldText, newText) {
  if (oldText === newText) {
    return [{ type: this.EQUAL, value: oldText }]
  }

  var oldLines = oldText.split(/\r?\n/)
  var newLines = newText.split(/\r?\n/)

  var diffResult = this._diffLines(oldLines, newLines)
  return this._mergeChanges(diffResult)
}

/**
 * 计算两行数组之间的差异
 */
MyersDiff.prototype._diffLines = function(oldLines, newLines) {
  var n = oldLines.length
  var m = newLines.length

  // 最大编辑距离
  var max = n + m

  // 使用 Map 存储 v 映射
  var v = new Map()
  v.set(1, 0)

  // 记录每一步的状态，用于回溯
  var trace = []

  // Myers 主循环
  for (var d = 0; d <= max; d++) {
    // 保存当前状态快照
    var snapshot = new Map()
    for (var entry of v) {
      snapshot.set(entry[0], entry[1])
    }
    trace.push(snapshot)

    // k 的范围是 [-d, d]，步长为 2
    for (var k = -d; k <= d; k += 2) {
      var x

      // 选择移动方向
      var v_k_minus_1 = v.get(k - 1)
      var v_k_plus_1 = v.get(k + 1)
      if (v_k_minus_1 === undefined) v_k_minus_1 = 0
      if (v_k_plus_1 === undefined) v_k_plus_1 = 0

      if (k === -d || (k !== d && v_k_minus_1 < v_k_plus_1)) {
        // 向下移动（插入操作）
        x = v_k_plus_1
      } else {
        // 向右移动（删除操作）
        x = v_k_minus_1 + 1
      }

      // 计算 y 坐标
      var y = x - k

      // 沿对角线移动
      while (x < n && y < m && oldLines[x] === newLines[y]) {
        x++
        y++
      }

      // 更新 v[k]
      v.set(k, x)

      // 检查是否到达终点
      if (x >= n && y >= m) {
        return this._buildDiff(trace, oldLines, newLines, n, m)
      }
    }
  }

  return []
}

/**
 * 回溯构建差异结果
 */
MyersDiff.prototype._buildDiff = function(trace, oldLines, newLines, n, m) {
  var diff = []
  var x = n
  var y = m

  // 从终点回溯到起点
  for (var d = trace.length - 1; d >= 0; d--) {
    var v = trace[d]
    var k = x - y

    // 确定前一个 k 值
    var prevK
    var v_k_minus_1 = v.get(k - 1)
    var v_k_plus_1 = v.get(k + 1)
    if (v_k_minus_1 === undefined) v_k_minus_1 = 0
    if (v_k_plus_1 === undefined) v_k_plus_1 = 0

    if (k === -d || (k !== d && v_k_minus_1 < v_k_plus_1)) {
      prevK = k + 1
    } else {
      prevK = k - 1
    }

    var prevX = v.get(prevK)
    if (prevX === undefined) prevX = 0
    var prevY = prevX - prevK

    // 添加相等的部分
    while (x > prevX && y > prevY) {
      diff.unshift({
        type: this.EQUAL,
        value: oldLines[x - 1]
      })
      x--
      y--
    }

    // 添加差异部分
    if (d > 0) {
      if (x === prevX) {
        diff.unshift({
          type: this.INSERT,
          value: newLines[y - 1]
        })
        y--
      } else if (y === prevY) {
        diff.unshift({
          type: this.DELETE,
          value: oldLines[x - 1]
        })
        x--
      }
    }
  }

  return diff
}

/**
 * 优化后的合并相邻变更方法
 */
MyersDiff.prototype._mergeChanges = function(diff) {
  if (diff.length <= 1) return diff

  var result = []
  var i = 0

  while (i < diff.length) {
    var current = diff[i]
    
    // 如果当前是删除操作，尝试合并后续的插入操作
    if (current.type === this.DELETE) {
      var deleteLines = [current.value]
      var j = i + 1
      
      // 收集连续的删除操作
      while (j < diff.length && diff[j].type === this.DELETE) {
        deleteLines.push(diff[j].value)
        j++
      }
      
      // 如果后面有插入操作，尝试合并
      if (j < diff.length && diff[j].type === this.INSERT) {
        var insertLines = [diff[j].value]
        var k = j + 1
        
        // 收集连续的插入操作
        while (k < diff.length && diff[k].type === this.INSERT) {
          insertLines.push(diff[k].value)
          k++
        }
        
        // 如果删除和插入数量相同，合并为修改
        if (deleteLines.length === insertLines.length) {
          for (var idx = 0; idx < deleteLines.length; idx++) {
            // 只有当内容不同时才标记为修改
            if (deleteLines[idx] !== insertLines[idx]) {
              result.push({
                type: this.MODIFY,
                oldValue: deleteLines[idx],
                newValue: insertLines[idx]
              })
            } else {
              // 内容相同，保持为相等
              result.push({
                type: this.EQUAL,
                value: deleteLines[idx]
              })
            }
          }
          i = k
          continue
        } else {
          // 数量不同，分别添加删除和插入
          deleteLines.forEach(function(line) {
            result.push({
              type: this.DELETE,
              value: line
            })
          }, this)
          
          insertLines.forEach(function(line) {
            result.push({
              type: this.INSERT,
              value: line
            })
          }, this)
          
          i = k
          continue
        }
      } else {
        // 没有后续插入操作，添加所有删除
        deleteLines.forEach(function(line) {
          result.push({
            type: this.DELETE,
            value: line
          })
        }, this)
        i = j
        continue
      }
    }
    
    // 处理相等和插入操作
    if (current.type === this.EQUAL || current.type === this.INSERT) {
      result.push(current)
      i++
    }
  }

  return result
}

// 导出单例
var myersDiffInstance = new MyersDiff()
exports.myersDiff = myersDiffInstance

