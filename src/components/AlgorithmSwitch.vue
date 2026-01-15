<template>
  <div class="algorithm-switch">
    <span class="label">对比算法：</span>
    <label class="radio" :class="{ active: !useDiffLibrary }">
      <input 
        type="radio" 
        :value="false" 
        v-model="useDiffLibrary"
        @change="onChange"
      >
      <span>自定义 Myers</span>
    </label>
    <label class="radio" :class="{ active: useDiffLibrary }">
      <input 
        type="radio" 
        :value="true" 
        v-model="useDiffLibrary"
        @change="onChange"
      >
      <span>diff 库</span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'AlgorithmSwitch',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      useDiffLibrary: this.value
    }
  },
  watch: {
    value(newVal) {
      this.useDiffLibrary = newVal
    }
  },
  methods: {
    onChange() {
      this.$emit('input', this.useDiffLibrary)
      this.$emit('change', this.useDiffLibrary)
    }
  }
}
</script>

<style scoped>
.algorithm-switch {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 8px;
}
.radio {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}
.radio:hover {
  background: #e9ecef;
}
.radio.active {
  background: #e3f2fd;
  color: #1976d2;
}
.radio input {
  display: none;
}
</style>
