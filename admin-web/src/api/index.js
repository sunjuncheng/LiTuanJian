import request from './request'

export const login = (data) => request.post('/admin/auth/login', data)

export const getDashboardStats = () => request.get('/admin/dashboard/stats')

export const getTaskList = (params) => request.get('/admin/tasks', { params })
export const getTaskDetail = (id) => request.get(`/admin/tasks/${id}`)
export const deleteTask = (id) => request.delete(`/admin/tasks/${id}`)
export const batchDeleteTasks = (ids) => request.post('/admin/tasks/batch-delete', { ids })
export const getPendingCheckins = (taskId) => request.get(`/admin/tasks/${taskId}/checkins/pending`)
export const reviewCheckin = (id, data) => request.post(`/admin/checkins/${id}/review`, data)

export const getUserList = (params) => request.get('/admin/users', { params })
export const updateUserStatus = (id, data) => request.put(`/admin/users/${id}/status`, data)
export const updateUser = (id, data) => request.put(`/admin/users/${id}`, data)

export const getCoachList = (params) => request.get('/admin/coaches', { params })
export const createCoach = (data) => request.post('/admin/coaches', data)
export const updateCoach = (id, data) => request.put(`/admin/coaches/${id}`, data)
export const deleteCoach = (id) => request.delete(`/admin/coaches/${id}`)

export const getSystemConfig = () => request.get('/admin/settings')
export const updateSystemConfig = (data) => request.put('/admin/settings', data)

export const getTeamList = (params) => request.get('/admin/teams', { params })
export const deleteTeam = (id) => request.delete(`/admin/teams/${id}`)
