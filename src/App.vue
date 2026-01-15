<template>
  <div class="container">
    <header>
      <h1>📝 文本对比工具</h1>
      <p class="description">拖放两个文本文件到左右窗口，使用 Myers Diff 算法进行智能对比</p>
      <AlgorithmSwitch 
        v-model="useDiffLibrary" 
        @change="onAlgorithmChange"
      />
    </header>

    <div class="comparison-container">
      <div class="file-area">
        <div class="file-header">
          <span class="file-name" :title="leftFileName">
            {{ leftFileName || '左侧文件' }}
          </span>
          <div class="sync-scroll">
            <input type="checkbox" id="syncScroll" v-model="syncScroll" class="sync-checkbox">
            <label for="syncScroll">同步滚动</label>
          </div>
        </div>
        <FileDropZone
          ref="leftDropZone"
          :content="leftContent"
          :file-name="leftFileName"
          :lines="leftLines"
          side="left"
          @file-drop="handleFileDrop"
          @file-select="handleFileSelect"
          @scroll="handleScroll"
        />
      </div>

      <div class="file-area">
        <div class="file-header">
          <span class="file-name" :title="rightFileName">
            {{ rightFileName || '右侧文件' }}
          </span>
        </div>
        <FileDropZone
          ref="rightDropZone"
          :content="rightContent"
          :file-name="rightFileName"
          :lines="rightLines"
          side="right"
          @file-drop="handleFileDrop"
          @file-select="handleFileSelect"
          @scroll="handleScroll"
        />
      </div>
    </div>

    <div class="controls">
      <button @click="compareTexts" :disabled="!canCompare">
        🔍 开始对比
      </button>
      <button @click="clearAll" :disabled="!hasData">
        🗑️ 清空
      </button>
      <button @click="swapFiles" :disabled="!hasData || !leftContent || !rightContent">
        🔄 交换文件
      </button>
    </div>

    <DiffStats :stats="diffStats" />

    <div class="legend" v-if="diffResult">
      <div class="legend-item">
        <div class="legend-color added"></div>
        <span>新增</span>
      </div>
      <div class="legend-item">
        <div class="legend-color removed"></div>
        <span>删除</span>
      </div>
      <div class="legend-item">
        <div class="legend-color modified"></div>
        <span>修改</span>
      </div>
      <div class="legend-item">
        <div class="legend-color unchanged"></div>
        <span>未变</span>
      </div>
    </div>
  </div>
</template>

<script>
var FileDropZone = require('./components/FileDropZone.vue')
var DiffStats = require('./components/DiffStats.vue')
var myersDiff = require('./utils/myersDiff').myersDiff
var diffLibrary = require('./utils/diffLibrary')
var fileReader = require('./utils/fileReader')
var AlgorithmSwitch = require('./components/AlgorithmSwitch.vue')

module.exports = {
  name: 'App',
  components: {
    FileDropZone: FileDropZone.default || FileDropZone,
    DiffStats: DiffStats.default || DiffStats,
    AlgorithmSwitch: AlgorithmSwitch.default || AlgorithmSwitch
  },
  data: function() {
    return {
      leftContent: '',
      rightContent: '',
      leftFileName: '',
      rightFileName: '',
      diffResult: null,
      syncScroll: true,
      diffStats: null,
      useDiffLibrary: false
    }
  },
  computed: {
    canCompare: function() {
      return this.leftContent && this.rightContent
    },
    hasData: function() {
      return this.leftContent || this.rightContent
    },
    leftLines: function() {
      return this.processLines('left')
    },
    rightLines: function() {
      return this.processLines('right')
    }
  },
  methods: {
    handleFileDrop: function(file, side) {
      var self = this
      fileReader.readFile(file).then(function(content) {
        self[side + 'Content'] = content
        self[side + 'FileName'] = file.name
        self.diffResult = null
        self.diffStats = null
      }).catch(function(error) {
        console.error('文件读取失败:', error)
        alert('文件读取失败，请重试')
      })
    },

    handleFileSelect: function(file, side) {
      this.handleFileDrop(file, side)
    },

    compareTexts: function() {
      if (!this.leftContent || !this.rightContent) {
        alert('请先选择两个文件进行对比')
        return
      }

      try {
        if (this.useDiffLibrary) {
          // 使用 diff 库
          console.log("当前使用的是diff 库")
          this.diffResult = diffLibrary.diff(this.leftContent, this.rightContent)
        } else {
          // 使用自定义 Myers 算法
          console.log("当前使用的是自定义 Myers 算法")
          this.diffResult = myersDiff.diff(this.leftContent, this.rightContent)
        }
        this.calculateStats()
      } catch (error) {
        console.error('对比失败:', error)
        alert('对比失败，请重试')
      }
    },

     // 算法切换处理
    onAlgorithmChange: function(useDiffLibrary) {
      // 切换后重新对比
      if (this.leftContent && this.rightContent) {
        this.compareTexts()
      }
    },

    calculateStats: function() {
      if (!this.diffResult) return

      var added = 0
      var removed = 0
      var modified = 0
      var unchanged = 0

      for (var i = 0; i < this.diffResult.length; i++) {
        var change = this.diffResult[i]
        switch (change.type) {
          case 'insert':
            added++
            break
          case 'delete':
            removed++
            break
          case 'modify':
            modified++
            break
          case 'equal':
            unchanged++
            break
        }
      }

      this.diffStats = { added: added, removed: removed, modified: modified, unchanged: unchanged }
    },

    clearAll: function() {
      this.leftContent = ''
      this.rightContent = ''
      this.leftFileName = ''
      this.rightFileName = ''
      this.diffResult = null
      this.diffStats = null
    },

    swapFiles: function() {
      var tempContent = this.leftContent
      var tempFileName = this.leftFileName

      this.leftContent = this.rightContent
      this.leftFileName = this.rightFileName
      this.rightContent = tempContent
      this.rightFileName = tempFileName

      if (this.diffResult) {
        this.compareTexts()
      }
    },

    handleScroll: function(side, scrollTop) {
      if (!this.syncScroll) return

      var otherSide = side === 'left' ? 'right' : 'left'
      var otherDropZone = this.$refs[otherSide + 'DropZone']

      if (otherDropZone) {
        otherDropZone.setScrollTop(scrollTop)
      }
    },

    processLines: function(side) {
      var content = this[side + 'Content']
      if (!content) return []

      if (this.diffResult) {
        var lines = []

        for (var i = 0; i < this.diffResult.length; i++) {
          var change = this.diffResult[i]
          if (change.type === 'equal') {
            lines.push({
              content: change.value,
              type: 'unchanged',
              showNumber: true
            })
          } else if (change.type === 'insert') {
            if (side === 'right') {
              lines.push({
                content: change.value,
                type: 'added',
                showNumber: true
              })
            } else {
              lines.push({
                content: '',
                type: 'empty-line',
                showNumber: false
              })
            }
          } else if (change.type === 'delete') {
            if (side === 'left') {
              lines.push({
                content: change.value,
                type: 'removed',
                showNumber: true
              })
            } else {
              lines.push({
                content: '',
                type: 'empty-line',
                showNumber: false
              })
            }
          } else if (change.type === 'modify') {
            if (side === 'left') {
              lines.push({
                content: change.oldValue,
                type: 'removed',
                showNumber: true
              })
            } else {
              lines.push({
                content: change.newValue,
                type: 'modified',
                showNumber: true
              })
            }
          }
        }

        return lines
      }

      var self = this
      return content.split(/\r?\n/).map(function(line) {
        return {
          content: line,
          type: 'unchanged',
          showNumber: true
        }
      })
    }
  }
}
</script>
