<template>
  <div class="card">
    <h3>Admin: All Timesheets</h3>
    <p v-if="!isAdmin" style="color:#fb7185">You are not an admin.</p>
    <table v-if="isAdmin" class="table">
      <thead>
        <tr><th>User</th><th>Email</th><th>Date</th><th>Project</th><th>Hours</th><th>Notes</th></tr>
      </thead>
      <tbody>
        <tr v-for="t in rows" :key="t.id">
          <td>{{ t.user_name }}</td>
          <td>{{ t.user_email }}</td>
          <td>{{ t.date }}</td>
          <td>{{ t.project }}</td>
          <td>{{ t.hours }}</td>
          <td>{{ t.notes }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api, getUser } from '../api'

const rows = ref([])
const user = ref(getUser())
const isAdmin = computed(() => user.value && user.value.role === 'admin')

async function load() {
  if (!isAdmin.value) return
  const res = await api().get('/timesheets')
  rows.value = res.data
}
onMounted(load)
</script>
