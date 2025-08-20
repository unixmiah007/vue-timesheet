<template>
  <div class="card">
    <h3>Upload Excel</h3>
    <p>Upload an .xlsx or .xls with columns: <code>date</code>, <code>project</code>, <code>hours</code>, <code>notes</code>.</p>
    <input type="file" @change="onFile" accept=".xlsx,.xls" />
    <button :disabled="!file" @click="upload">Upload</button>
    <p v-if="msg" style="color:#34d399">{{ msg }}</p>
    <p v-if="error" style="color:#fb7185">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api'

const file = ref(null)
const msg = ref('')
const error = ref('')

function onFile(e) {
  file.value = e.target.files[0]
}

async function upload() {
  msg.value = ''
  error.value = ''
  try {
    const form = new FormData()
    form.append('file', file.value)
    const res = await api().post('/upload/excel', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    msg.value = `Imported ${res.data.inserted_count} rows.`
  } catch (e) {
    error.value = e?.response?.data?.error || 'Upload failed'
  }
}
</script>
