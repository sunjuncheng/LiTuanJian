<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <div class="stat-card" :style="{ background: stat.gradient }">
          <div class="label">{{ stat.label }}</div>
          <div class="value">{{ stat.value }}</div>
          <div class="icon-wrap">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>最近活动任务</span>
          <el-tag type="success" effect="plain">实时更新</el-tag>
        </div>
      </template>
      <el-table :data="recentTasks" stripe>
        <el-table-column prop="name" label="任务名称" />
        <el-table-column prop="participantCount" label="参与人数" width="120" />
        <el-table-column prop="checkpointCount" label="打卡点数" width="120" />
        <el-table-column prop="completionRate" label="完成度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate || 0" :color="progressColor" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Medal, Flag, Calendar } from '@element-plus/icons-vue'
import { getDashboardStats } from '@/api'

const stats = ref([
  { label: '总用户数', value: 0, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: User },
  { label: '总教练数', value: 0, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: Medal },
  { label: '进行中任务', value: 0, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: Flag },
  { label: '今日打卡数', value: 0, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: Calendar }
])

const recentTasks = ref([])

const progressColor = (percentage) => {
  if (percentage < 30) return '#ff4d4f'
  if (percentage < 70) return '#faad14'
  return '#52c41a'
}

onMounted(async () => {
  try {
    const data = await getDashboardStats()
    if (data.stats) {
      stats.value.forEach((s, i) => {
        s.value = data.stats[i]?.value || 0
      })
    }
    recentTasks.value = data.recentTasks || []
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
