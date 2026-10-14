<template>
  <div class="page-container" v-loading="loading">
    <el-page-header @back="$router.back()" :content="task?.name || '任务详情'" />

    <el-card style="margin-top: 20px" v-if="task">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="任务名称">{{ task.name }}</el-descriptions-item>
        <el-descriptions-item label="创建教练">{{ task.coachName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(task.status)">
            {{ statusText(task.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="打卡点数">{{ task.checkpointCount }}</el-descriptions-item>
        <el-descriptions-item label="参与人数">{{ task.participantCount }}</el-descriptions-item>
        <el-descriptions-item label="完成度">{{ task.completionRate }}%</el-descriptions-item>
        <el-descriptions-item label="截止时间">{{ formatTime(task.deadline) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ formatTime(task.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="margin-top: 20px" header="任务简介">
      <p>{{ task?.description || '暂无简介' }}</p>
    </el-card>

    <el-card style="margin-top: 20px" header="打卡点位">
      <el-table :data="task?.checkpoints || []" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="name" label="打卡点名称" min-width="150" />
        <el-table-column prop="latitude" label="纬度" width="120" />
        <el-table-column prop="longitude" label="经度" width="120" />
        <el-table-column prop="range" label="误差范围(米)" width="120" />
        <el-table-column label="参照图" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.referenceImage"
              :src="row.referenceImage"
              style="width: 70px; height: 70px"
              :preview-src-list="[row.referenceImage]"
              fit="cover"
            />
            <span v-else style="color: #ccc">无</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px" header="接单情况">
      <el-table :data="task?.participants || []" stripe v-if="task?.participants?.length">
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column label="用户信息" min-width="180">
          <template #default="{ row }">
            <div>{{ row.nickname }}</div>
            <div style="color: #999; font-size: 12px">{{ row.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="接单类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.participantType === 'solo' ? 'info' : 'warning'">
              {{ row.participantTypeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teamName" label="团队" width="130">
          <template #default="{ row }">
            {{ row.teamName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="进度" width="200">
          <template #default="{ row }">
            <el-progress :percentage="row.percentage" :status="row.percentage === 100 ? 'success' : ''" />
          </template>
        </el-table-column>
        <el-table-column label="完成情况" width="120">
          <template #default="{ row }">
            {{ row.passedCount }}/{{ row.totalCheckpoints }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="participantStatusType(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="接单时间" width="170">
          <template #default="{ row }">{{ formatTime(row.joinedAt) }}</template>
        </el-table-column>
        <el-table-column label="最后打卡时间" width="170">
          <template #default="{ row }">{{ formatTime(row.lastCheckinTime) }}</template>
        </el-table-column>
        <el-table-column label="完成时间" width="170">
          <template #default="{ row }">{{ formatTime(row.completedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showParticipantDetail(row)">查看打卡</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无参与者" :image-size="80" />
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="打卡详情" width="800px" top="5vh">
      <div v-if="currentParticipant">
        <el-descriptions :column="2" border style="margin-bottom: 16px">
          <el-descriptions-item label="用户">{{ currentParticipant.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentParticipant.phone }}</el-descriptions-item>
          <el-descriptions-item label="接单类型">{{ currentParticipant.participantTypeText }}</el-descriptions-item>
          <el-descriptions-item label="团队">{{ currentParticipant.teamName || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-table :data="currentParticipant.checkpoints || []" stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="checkpointName" label="打卡点" min-width="130" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="checkinStatusType(row.status)">{{ checkinStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="打卡图片" width="100">
            <template #default="{ row }">
              <el-image
                v-if="row.photoUrl"
                :src="row.photoUrl"
                style="width: 60px; height: 60px"
                :preview-src-list="[row.photoUrl]"
                fit="cover"
              />
              <span v-else style="color: #ccc">-</span>
            </template>
          </el-table-column>
          <el-table-column label="打卡时间" width="170">
            <template #default="{ row }">{{ formatTime(row.checkinTime) }}</template>
          </el-table-column>
          <el-table-column label="审核时间" width="170">
            <template #default="{ row }">{{ formatTime(row.reviewTime) }}</template>
          </el-table-column>
          <el-table-column label="驳回原因" min-width="130">
            <template #default="{ row }">{{ row.rejectReason || '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 'reviewing'">
                <el-button type="success" link @click="handleReview(row, 'passed')">通过</el-button>
                <el-button type="danger" link @click="openRejectDialog(row)">驳回</el-button>
              </template>
              <span v-else style="color: #999">已审核</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <el-dialog v-model="rejectDialogVisible" title="驳回打卡" width="450px">
      <el-form label-width="80px">
        <el-form-item label="驳回原因">
          <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTaskDetail, reviewCheckin } from '@/api'

const route = useRoute()
const task = ref(null)
const loading = ref(false)
const detailDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentParticipant = ref(null)
const currentCheckpoint = ref(null)
const rejectReason = ref('')

const formatTime = (t) => {
  if (!t) return '-'
  const d = new Date(t)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const statusText = (s) => ({ draft: '草稿', published: '已发布', ended: '已结束' }[s] || s)
const statusTagType = (s) => ({ draft: 'info', published: 'success', ended: 'warning' }[s] || 'info')
const participantStatusType = (s) => ({ in_progress: 'primary', completed: 'success', overdue: 'danger' }[s] || 'info')
const checkinStatusText = (s) => ({ pending: '未打卡', reviewing: '待审核', passed: '已通过', rejected: '已驳回' }[s] || s)
const checkinStatusType = (s) => ({ pending: 'info', reviewing: 'warning', passed: 'success', rejected: 'danger' }[s] || 'info')

const loadDetail = async () => {
  loading.value = true
  try {
    task.value = await getTaskDetail(route.params.id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const showParticipantDetail = (row) => {
  currentParticipant.value = row
  detailDialogVisible.value = true
}

const handleReview = async (row, status) => {
  if (!row.checkinId) {
    ElMessage.warning('该打卡点暂无打卡记录')
    return
  }
  try {
    await reviewCheckin(row.checkinId, { status })
    ElMessage.success(status === 'passed' ? '已通过' : '操作成功')
    loadDetail()
  } catch (e) {
    console.error(e)
  }
}

const openRejectDialog = (row) => {
  currentCheckpoint.value = row
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  if (!currentCheckpoint.value?.checkinId) {
    ElMessage.warning('该打卡点暂无打卡记录')
    return
  }
  try {
    await reviewCheckin(currentCheckpoint.value.checkinId, {
      status: 'rejected',
      rejectReason: rejectReason.value,
    })
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    loadDetail()
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadDetail)
</script>
