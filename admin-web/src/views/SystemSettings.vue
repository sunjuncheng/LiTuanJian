<template>
  <div class="page-container">
    <el-card>
      <el-form :model="form" label-width="180px" style="max-width: 700px">
        <el-form-item label="系统名称">
          <el-input v-model="form.systemName" />
        </el-form-item>

        <el-divider content-position="left">用户端小程序配置</el-divider>
        <el-form-item label="用户端AppID">
          <el-input v-model="form.userWxAppId" placeholder="用户端小程序的 AppID" />
        </el-form-item>
        <el-form-item label="用户端Secret">
          <el-input v-model="form.userWxAppSecret" type="password" show-password placeholder="用户端小程序的 AppSecret" />
        </el-form-item>

        <el-divider content-position="left">教练端小程序配置</el-divider>
        <el-form-item label="教练端AppID">
          <el-input v-model="form.coachWxAppId" placeholder="教练端小程序的 AppID" />
        </el-form-item>
        <el-form-item label="教练端Secret">
          <el-input v-model="form.coachWxAppSecret" type="password" show-password placeholder="教练端小程序的 AppSecret" />
        </el-form-item>

        <el-divider content-position="left">其他设置</el-divider>
        <el-form-item label="文件上传大小限制(MB)">
          <el-input-number v-model="form.uploadSizeLimit" :min="1" :max="50" />
        </el-form-item>
        <el-form-item label="默认定位误差(米)">
          <el-input-number v-model="form.defaultLocationRange" :min="10" :max="200" />
        </el-form-item>

        <el-divider content-position="left">阿里云直播配置</el-divider>
        <el-form-item label="推流域名">
          <el-input v-model="form.aliLivePushDomain" placeholder="例如 push.live.xxx.com" />
        </el-form-item>
        <el-form-item label="播放域名">
          <el-input v-model="form.aliLivePlayDomain" placeholder="例如 play.live.xxx.com" />
        </el-form-item>
        <el-form-item label="应用名称 AppName">
          <el-input v-model="form.aliLiveAppName" placeholder="默认填 live" />
        </el-form-item>
        <el-form-item label="鉴权 Key">
          <el-input v-model="form.aliLiveAuthKey" type="password" show-password placeholder="未开启鉴权可先留空" />
        </el-form-item>
        <el-form-item label="鉴权有效期(秒)">
          <el-input-number v-model="form.aliLiveAuthExpireSeconds" :min="300" :max="86400" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, updateSystemConfig } from '@/api'
import { useUserStore } from '@/store'

const saving = ref(false)
const userStore = useUserStore()
const form = reactive({
  systemName: '',
  userWxAppId: '',
  userWxAppSecret: '',
  coachWxAppId: '',
  coachWxAppSecret: '',
  uploadSizeLimit: 10,
  defaultLocationRange: 50,
  aliLivePushDomain: '',
  aliLivePlayDomain: '',
  aliLiveAppName: 'live',
  aliLiveAuthKey: '',
  aliLiveAuthExpireSeconds: 3600
})

onMounted(async () => {
  try {
    const data = await getSystemConfig()
    Object.assign(form, data)
  } catch (e) {
    console.error(e)
  }
})

const handleSave = async () => {
  saving.value = true
  try {
    await updateSystemConfig(form)
    userStore.setSystemName(form.systemName)
    ElMessage.success('保存成功')
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>
