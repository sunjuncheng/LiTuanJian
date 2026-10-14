<template>
  <div class="page-container">
    <el-card>
      <div class="search-bar">
        <el-input v-model="search.keyword" placeholder="教练姓名" clearable style="width: 200px" />
        <el-button type="primary" @click="loadList">查询</el-button>
        <el-button :icon="Refresh" @click="loadList">刷新</el-button>
        <el-button type="success" @click="openDialog()">新增教练</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="taskCount" label="创建任务数" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'danger' : 'success'" link @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑教练' : '新增教练'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getCoachList, createCoach, updateCoach } from '@/api'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const search = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const form = reactive({ id: '', name: '', phone: '', password: '' })
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [
    {
      validator: (rule, value, callback) => {
        if (!isEdit.value && !value) {
          callback(new Error('请输入密码'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loadList = async () => {
  loading.value = true
  try {
    const data = await getCoachList({ ...search, ...pagination })
    tableData.value = data.list
    pagination.total = data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openDialog = (row) => {
  isEdit.value = !!row
  if (row) {
    form.id = row.id
    form.name = row.name
    form.phone = row.phone
    form.password = ''
  } else {
    form.id = ''
    form.name = ''
    form.phone = ''
    form.password = ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      const payload = { name: form.name, phone: form.phone }
      if (form.password) payload.password = form.password
      await updateCoach(form.id, payload)
    } else {
      await createCoach(form)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadList()
  } catch (e) {
    console.error(e)
  }
}

const toggleStatus = async (row) => {
  try {
    await updateCoach(row.id, { status: row.status === 1 ? 0 : 1 })
    ElMessage.success('操作成功')
    loadList()
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadList)
</script>
