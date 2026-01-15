<template>
  <div class="stats" v-if="stats">
    <strong>差异统计：</strong>
    <span class="stat-added">新增 {{ stats.added }} 行</span>
    <span class="separator">|</span>
    <span class="stat-removed">删除 {{ stats.removed }} 行</span>
    <span class="separator">|</span>
    <span class="stat-modified">修改 {{ stats.modified }} 行</span>
    <span class="separator">|</span>
    <span class="stat-unchanged">相同 {{ stats.unchanged }} 行</span>
  </div>
</template>

<script>
module.exports = {
  name: 'DiffStats',
  props: {
    stats: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped>
.stats {
  text-align: center;
  margin-top: 15px;
  padding: 12px 20px;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  color: #555;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stats strong {
  color: #2c3e50;
}

.stat-added {
  color: #28a745;
  font-weight: 500;
}

.stat-removed {
  color: #dc3545;
  font-weight: 500;
}

.stat-modified {
  color: #ffc107;
  font-weight: 500;
}

.stat-unchanged {
  color: #6c757d;
}

.separator {
  margin: 0 10px;
  color: #ddd;
}
</style>
