<template>
  <div class="login-container">
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>

    <div class="login-box">
      <div class="login-header">
        <div class="logo-icon">
          <el-icon :size="40"><Trophy /></el-icon>
        </div>
        <h1>团建打卡</h1>
        <p>运动管理后台</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
          登 录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    const data = await login(form)
    userStore.setToken(data.token)
    userStore.setAdminInfo(data.adminInfo)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a2332 0%, #2d3e50 50%, #1a2332 100%);
  position: relative;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: #ff6b35;
  top: -100px;
  left: -100px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: #f7931e;
  bottom: -80px;
  right: -80px;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: #f5576c;
  top: 40%;
  right: 20%;
  opacity: 0.3;
}

.login-box {
  width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin: 0 auto 20px;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
}

.login-header h1 {
  font-size: 28px;
  color: #1e293b;
  margin-bottom: 6px;
  font-weight: bold;
}

.login-header p {
  color: #94a3b8;
  font-size: 14px;
  letter-spacing: 2px;
}

.login-form {
  margin-bottom: 0;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 12px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #ff6b35 inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #ff6b35 inset !important;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  letter-spacing: 4px;
  border-radius: 12px;
  margin-top: 8px;
}
</style>
