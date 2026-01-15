<template>
  <div
    class="drop-zone"
    :class="{ 'dragover': isDragOver }"
    @drop="handleDrop"
    @dragover.prevent
    @dragenter.prevent="isDragOver = true"
    @dragleave.prevent="isDragOver = false"
    @click="triggerFileInput"
  >
    <div class="drop-text" v-if="!content">
      <span class="icon">📄</span>
      <p>点击或拖放文件到此处</p>
      <p class="hint">支持 .txt, .js, .html, .css, .py, .java, .md 等格式</p>
    </div>

    <div class="text-display" v-else ref="textDisplay" @scroll="handleScroll">
      <div
        v-for="(line, index) in lines"
        :key="index"
        class="line-row"
        :class="line.type"
      >
        <span class="line-number">{{ line.showNumber ? index + 1 : '' }}</span>
        <span class="line-content">{{ line.content }}</span>
      </div>
    </div>

    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      style="display: none"
      accept=".txt,.js,.html,.css,.py,.java,.cpp,.c,.md,.json,.xml"
    >
  </div>
</template>

<script>
module.exports = {
  name: 'FileDropZone',
  props: {
    content: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    lines: {
      type: Array,
      default: function() {
        return []
      }
    },
    side: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      isDragOver: false
    }
  },
  methods: {
    handleDrop: function(event) {
      event.preventDefault()
      this.isDragOver = false

      var files = event.dataTransfer.files
      if (files.length > 0) {
        this.$emit('file-drop', files[0], this.side)
      }
    },

    triggerFileInput: function() {
      if (!this.content) {
        this.$refs.fileInput.click()
      }
    },

    handleFileSelect: function(event) {
      var file = event.target.files[0]
      if (file) {
        this.$emit('file-select', file, this.side)
      }
    },

    handleScroll: function(event) {
      this.$emit('scroll', this.side, event.target.scrollTop)
    },

    setScrollTop: function(scrollTop) {
      if (this.$refs.textDisplay) {
        this.$refs.textDisplay.scrollTop = scrollTop
      }
    }
  },
  watch: {
    isDragOver: function(newVal) {
      if (newVal) {
        var self = this
        setTimeout(function() {
          self.isDragOver = false
        }, 100)
      }
    }
  }
}
</script>

<style scoped>
.drop-zone {
  flex: 1;  /* 占据父容器全部空间 */
  display: flex;
  align-items: stretch;  /* 关键：让子元素填满高度 */
  border: 2px dashed #bdc3c7;
  margin: 0;
  border-radius: 6px;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;  /* 外层容器隐藏溢出 */
  min-height: 100px;
}

.drop-zone:hover,
.drop-zone.dragover {
  border-color: #3498db;
  background-color: #f0f8ff;
}

.drop-text {
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;  /* 让 drop-text 填满父容器 */
}

.drop-text .icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.drop-text .hint {
  font-size: 12px;
  margin-top: 8px;
  color: #95a5a6;
}

.text-display {
  flex: 1;
  overflow: auto;  /* 关键：允许这个区域滚动 */
  padding: 10px;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  background-color: #fdfdfd;
  /* 确保滚动区域正确计算高度 */
  min-height: 0;
}

.line-row {
  display: flex;
  min-height: 1.6em;
}

.line-number {
  display: inline-block;
  width: 50px;
  text-align: right;
  padding-right: 12px;
  color: #999;
  user-select: none;
  border-right: 1px solid #e0e0e0;
  margin-right: 12px;
  flex-shrink: 0;
  background-color: #f5f5f5;
}

.line-content {
  flex: 1;
  overflow-wrap: break-word;
}

.added {
  background-color: #d4edda !important;
}

.removed {
  background-color: #f8d7da !important;
}

.modified {
  background-color: #fff3cd !important;
}

.unchanged {
  background-color: transparent;
}

.empty-line {
  background-color: #f8f9fa;
}
</style>

