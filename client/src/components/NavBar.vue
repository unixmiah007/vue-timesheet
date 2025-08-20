<template>
  <nav v-if="user" class="flex">
    <router-link to="/timesheets">My Timesheets</router-link>
    <router-link to="/upload">Upload Excel</router-link>
    <router-link v-if="user.role === 'admin'" to="/admin">Admin</router-link>
    <span class="badge">{{ user.name }} ({{ user.role }})</span>
    <button class="secondary" @click="logout">Logout</button>
  </nav>
  <nav v-else>
    <router-link to="/login">Login</router-link>
    <router-link to="/register">Register</router-link>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUser, clearAuth } from '../api'

const user = ref(null)
onMounted(() => {
  user.value = getUser()
})

function logout() {
  clearAuth()
  window.location.href = '/login'
}
</script>
