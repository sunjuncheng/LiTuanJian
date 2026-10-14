import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 0) {
      return res.data
    } else if (res.code === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
      return Promise.reject(res)
    } else {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(res)
    }
  },
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
