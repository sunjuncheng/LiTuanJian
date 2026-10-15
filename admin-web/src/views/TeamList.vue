<template>
  <div class="page-container">
    <el-card>
      <div class="search-bar">
        <el-input v-model="search.keyword" placeholder="队伍名称" clearable style="width: 240px" />
        <el-button type="primary" @click="loadList">查询</el-button>
        <el-button :icon="Refresh" @click="loadList">刷新</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="name" label="队伍名称" min-width="150" />
        <el-table-column prop="inviteCode" label="邀请码" width="120" />
        <el-table-column prop="memberCount" label="成员数" width="100" align="center" />
        <el-table-column prop="leaderName" label="队长" width="120" />
        <el-table-column prop="leaderPhone" label="队长手机号" width="150" />
        <el-table-column label="关联任务" width="100" align="center">
          <template #default="{ row }">
            {{ row.taskId ? '#' + row.taskId : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openMembersDialog(row)">查看成员</el-button>
            <el-button type="danger" link @click="handleDelete(row)">解散</el-button>
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

    <el-dialog v-model="membersVisible" :title="currentTeam?.name + ' - 成员列表'" width="600px">
      <el-table :data="currentTeam?.members || []" stripe>
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar :size="36" :src="row.avatarUrl || ''">
              {{ row.nickname?.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column label="身份" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isLeader ? 'warning' : 'info'" size="small">
              {{ row.isLeader ? '队长' : '成员' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="membersVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getTeamList, deleteTeam } from '@/api'

const loading = ref(false)
const tableData = ref([])
const membersVisible = ref(false)
const currentTeam = ref(null)
const search = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const loadList = async () => {
  loading.value = true
  try {
    const data = await getTeamList({ ...search, ...pagination })
    tableData.value = data.list
    pagination.total = data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openMembersDialog = (row) => {
  currentTeam.value = row
  membersVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要解散队伍「${row.name}」吗？该操作不可恢复。`,
      '提示',
      { type: 'warning' }
    )
    await deleteTeam(row.id)
    ElMessage.success('已解散')
    loadList()
  } catch (e) {
    if (e !== 'cancel' && e !== false) console.error(e)
  }
}

onMounted(loadList)
</script>
