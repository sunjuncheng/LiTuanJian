<template>
  <div class="page-container">
    <el-card>
      <div class="tab-bar">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="all" />
          <el-tab-pane label="草稿" name="draft" />
          <el-tab-pane label="进行中" name="published" />
          <el-tab-pane label="已结束" name="ended" />
        </el-tabs>
      </div>

      <div class="search-bar">
        <el-input v-model="search.name" placeholder="任务名称" clearable style="width: 200px" />
        <el-button type="primary" @click="loadList">查询</el-button>
        <el-button :icon="Refresh" @click="loadList">刷新</el-button>
        <el-button
          type="danger"
          :disabled="selectedIds.length === 0"
          :loading="batchDeleting"
          @click="handleBatchDelete"
        >
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>

      <el-table
        :data="tableData"
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="name" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="coachName" label="创建教练" width="120" />
        <el-table-column prop="checkpointCount" label="打卡点数" width="100" />
        <el-table-column prop="participantCount" label="参与人数" width="100" />
        <el-table-column label="完成度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate || 0" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row.id)">详情</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadList"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getTaskList, deleteTask, batchDeleteTasks } from '@/api'

const router = useRouter()
const loading = ref(false)
const batchDeleting = ref(false)
const tableData = ref([])
const selectedIds = ref([])

const activeTab = ref('all')
const search = reactive({ name: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const statusText = (status) => {
  return { draft: '草稿', published: '进行中', ended: '已结束' }[status] || status
}

const statusTagType = (status) => {
  return { draft: 'info', published: 'success', ended: 'warning' }[status] || 'info'
}

const handleTabChange = () => {
  pagination.page = 1
  loadList()
}

const loadList = async () => {
  loading.value = true
  try {
    const status = activeTab.value === 'all' ? '' : activeTab.value
    const data = await getTaskList({ ...search, status, ...pagination })
    tableData.value = data.list
    pagination.total = data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id)
}

const goDetail = (id) => {
  router.push(`/tasks/${id}`)
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该任务吗？', '提示', { type: 'warning' })
    await deleteTask(id)
    ElMessage.success('删除成功')
    loadList()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 个任务吗？此操作不可恢复`,
      '批量删除',
      { type: 'warning' }
    )
    batchDeleting.value = true
    await batchDeleteTasks(selectedIds.value)
    ElMessage.success(`成功删除 ${selectedIds.value.length} 个任务`)
    selectedIds.value = []
    loadList()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  } finally {
    batchDeleting.value = false
  }
}

onMounted(loadList)
</script>

<style scoped>
.tab-bar {
  margin-bottom: 8px;
}

.tab-bar :deep(.el-tabs__item) {
  font-size: 15px;
  height: 44px;
  line-height: 44px;
}

.tab-bar :deep(.el-tabs__active-bar) {
  background-color: #ff6b35;
}

.tab-bar :deep(.el-tabs__item.is-active) {
  color: #ff6b35;
  font-weight: 600;
}
</style>
