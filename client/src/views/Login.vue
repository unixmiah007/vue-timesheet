<template>
  <div class="card">
    <h3>Login</h3>
    <div class="flex">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" placeholder="Password" type="password" />
      <button @click="doLogin">Login</button>
    </div>
    <p v-if="error" style="color:#fb7185">{{ error }}</p>
    <p>Default admin: <code>admin@example.com / admin123</code></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api, setAuth } from '../api'

const email = ref('')
const password = ref('')
const error = ref('')

async function doLogin() {
  error.value = ''
  try {
    const res = await api().post('/login', { email: email.value, password: password.value })
    setAuth(res.data.token, res.data.user)
    window.location.href = '/timesheets'
  } catch (e) {
    error.value = e?.response?.data?.error || 'Login failed'
  }
}
</script>
