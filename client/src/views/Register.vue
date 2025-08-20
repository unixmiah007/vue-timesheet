<template>
  <div class="card">
    <h3>Register</h3>
    <div class="flex">
      <input v-model="name" placeholder="Name" />
      <input v-model="email" placeholder="Email" />
      <input v-model="password" placeholder="Password" type="password" />
      <button @click="doRegister">Create Account</button>
    </div>
    <p v-if="message" style="color:#34d399">{{ message }}</p>
    <p v-if="error" style="color:#fb7185">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api'

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const message = ref('')

async function doRegister() {
  error.value = ''
  message.value = ''
  try {
    await api().post('/register', { name: name.value, email: email.value, password: password.value })
    message.value = 'Account created. Please log in.'
  } catch (e) {
    error.value = e?.response?.data?.error || 'Register failed'
  }
}
</script>
