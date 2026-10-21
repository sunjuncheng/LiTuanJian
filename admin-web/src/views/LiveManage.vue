<template>
  <div class="page-container">
    <el-alert
      v-if="!config.configured"
      title="请先在系统设置中填写阿里云直播推流域名、播放域名和 AppName，再创建直播房间。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 16px"
    />

    <el-card>
      <div class="search-bar">
        <el-button type="primary" @click="openCreateDialog">创建直播</el-button>
        <el-button @click="loadList" :loading="loading">刷新</el-button>
      </div>

      <div class="config-summary" v-if="config.pushDomain || config.playDomain">
        <div class="config-item">
          <span class="config-label">推流域名</span>
          <span class="config-value">{{ config.pushDomain || '未配置' }}</span>
        </div>
        <div class="config-item">
          <span class="config-label">播放域名</span>
          <span class="config-value">{{ config.playDomain || '未配置' }}</span>
        </div>
        <div class="config-item">
          <span class="config-label">AppName</span>
          <span class="config-value">{{ config.appName || 'live' }}</span>
        </div>
      </div>

      <el-table :data="list" stripe v-loading="loading" row-key="id">
        <el-table-column prop="title" label="直播标题" min-width="180" />
        <el-table-column prop="anchorName" label="主播名称" width="120" />
        <el-table-column prop="streamName" label="流名称" width="160" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="播放地址" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="url-text">{{ row.playUrl || '待配置' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="推流地址" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="url-stack">
              <span class="url-text">{{ row.pushUrl || '待配置' }}</span>
              <span class="sub-text">OBS 服务器：{{ row.obsServer || '待配置' }}</span>
              <span class="sub-text">OBS 串流码：{{ row.streamKey || '待配置' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="420" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="copyText(row.pushUrl, '推流地址已复制')">复制推流</el-button>
            <el-button type="success" link @click="copyText(row.playUrl, '播放地址已复制')">复制播放</el-button>
            <el-button type="primary" link @click="copyText(row.obsServer, 'OBS 服务器地址已复制')">复制服务器</el-button>
            <el-button type="success" link @click="copyText(row.streamKey, 'OBS 串流码已复制')">复制串流码</el-button>
            <el-button
              v-if="row.status !== 'live'"
              type="warning"
              link
              @click="handleStart(row)"
            >
              标记开播
            </el-button>
            <el-button
              v-else
              type="danger"
              link
              @click="handleStop(row)"
            >
              结束直播
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="创建直播" width="560px">
      <el-form :model="form" label-width="110px">
        <el-form-item label="直播标题">
          <el-input v-model="form.title" placeholder="例如：团建任务直播讲解" />
        </el-form-item>
        <el-form-item label="主播名称">
          <el-input v-model="form.anchorName" placeholder="例如：官方直播间" />
        </el-form-item>
        <el-form-item label="流名称">
          <el-input v-model="form.streamName" placeholder="可不填，系统会自动生成" />
        </el-form-item>
        <el-form-item label="封面图">
          <el-input v-model="form.coverImage" placeholder="可填写图片 URL，后续用户端用于展示封面" />
        </el-form-item>
        <el-form-item label="直播简介">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="介绍本场直播内容，例如任务说明、注意事项等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleCreate">创建直播</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createLiveRoom, getLiveList, startLiveRoom, stopLiveRoom } from '@/api'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const list = ref([])
const config = reactive({
  pushDomain: '',
  playDomain: '',
  appName: 'live',
  configured: false,
})

const defaultForm = () => ({
  title: '',
  anchorName: '官方直播间',
  streamName: '',
  coverImage: '',
  description: '',
})

const form = reactive(defaultForm())

const statusType = (status) => {
  return {
    draft: 'info',
    live: 'success',
    ended: 'warning',
  }[status] || 'info'
}

const resetForm = () => {
  Object.assign(form, defaultForm())
}

const loadList = async () => {
  loading.value = true
  try {
    const data = await getLiveList()
    list.value = data.list || []
    Object.assign(config, {
      pushDomain: data.config?.pushDomain || '',
      playDomain: data.config?.playDomain || '',
      appName: data.config?.appName || 'live',
      configured: !!data.config?.configured,
    })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const handleCreate = async () => {
  if (!form.title.trim()) {
    ElMessage.warning('请先填写直播标题')
    return
  }
  saving.value = true
  try {
    await createLiveRoom(form)
    ElMessage.success('直播房间已创建')
    dialogVisible.value = false
    loadList()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

const handleStart = async (row) => {
  try {
    await ElMessageBox.confirm(
      '标记开播后，用户端会把这场直播识别为当前直播。请确认你已经准备好推流。',
      '开始直播',
      { type: 'warning' }
    )
    await startLiveRoom(row.id)
    ElMessage.success('已切换为直播中')
    loadList()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const handleStop = async (row) => {
  try {
    await ElMessageBox.confirm('结束直播后，用户端将不再显示直播中状态。是否继续？', '结束直播', {
      type: 'warning'
    })
    await stopLiveRoom(row.id)
    ElMessage.success('直播已结束')
    loadList()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const copyText = async (text, successText) => {
  if (!text) {
    ElMessage.warning('当前地址尚未生成，请先检查直播配置')
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(successText)
  } catch (e) {
    ElMessage.error('复制失败，请手动复制')
  }
}

onMounted(loadList)
</script>

<style scoped>
.config-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.config-item {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
}

.config-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}

.config-value {
  color: #0f172a;
  font-weight: 600;
  word-break: break-all;
}

.url-text {
  font-size: 12px;
  color: #475569;
  word-break: break-all;
  line-height: 1.5;
}

.url-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-text {
  font-size: 12px;
  color: #94a3b8;
  word-break: break-all;
  line-height: 1.5;
}
</style>
