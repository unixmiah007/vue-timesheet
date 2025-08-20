<template>
  <div class="card">
    <div class="space-between">
      <h3>My Timesheets</h3>
      <div class="flex">
        <label>Per page</label>
        <select v-model.number="pageSize" @change="changePageSize">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
        <button @click="newEntry">New Entry</button>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr><th>Date</th><th>Project</th><th>Hours</th><th>Notes</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="t in rows" :key="t.id">
          <td>{{ t.date }}</td>
          <td>{{ t.project }}</td>
          <td>{{ t.hours }}</td>
          <td>{{ t.notes }}</td>
          <td class="flex">
            <button class="secondary" @click="editEntry(t)">Edit</button>
            <button @click="delEntry(t)">Delete</button>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td colspan="5" style="text-align:center; opacity:.7;">No entries</td>
        </tr>
      </tbody>
    </table>

    <div class="space-between" style="margin-top: 10px;">
      <div>Showing {{ startIndex }}–{{ endIndex }} of {{ total }}</div>
      <div class="flex">
        <button class="secondary" :disabled="page<=1" @click="goPrev">Prev</button>
        <span style="padding:0 8px;">Page {{ page }} / {{ totalPages }}</span>
        <button :disabled="page>=totalPages" @click="goNext">Next</button>
      </div>
    </div>
  </div>

  <div class="card" v-if="editing">
    <h3>{{ form.id ? 'Edit' : 'New' }} Timesheet</h3>
    <div class="flex">
      <input v-model="form.date" type="date" />
      <input v-model="form.project" placeholder="Project" />
      <input v-model.number="form.hours" type="number" min="0" step="0.25" placeholder="Hours" />
      <input v-model="form.notes" placeholder="Notes" />
      <button @click="save">Save</button>
      <button class="secondary" @click="cancel">Cancel</button>
    </div>
    <p v-if="error" style="color:#fb7185">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../api'

const rows = ref([])
const editing = ref(false)
const error = ref('')
const form = ref({ id: null, date: '', project: '', hours: 0, notes: '' })

const page = ref(1)
// ✅ Default 5 per page
const pageSize = ref(5)
const total = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const startIndex = computed(() => total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1)
const endIndex = computed(() => total.value === 0 ? 0 : Math.min(total.value, (page.value - 1) * pageSize.value + rows.value.length))

async function load() {
  const res = await api().get('/timesheets', { params: { page: page.value, pageSize: pageSize.value } })
  const payload = res.data

  if (Array.isArray(payload)) {
    // Server returned ALL rows (no server-side pagination) → slice on client
    total.value = payload.length
    const start = (page.value - 1) * pageSize.value
    const end = start + pageSize.value
    rows.value = payload.slice(start, end)
  } else {
    // Server-side pagination
    rows.value = payload.data
    total.value = payload.pagination.total
  }
}

onMounted(load)

function changePageSize() {
  page.value = 1
  load()
}

function goPrev() {
  if (page.value > 1) {
    page.value--
    load()
  }
}

function goNext() {
  if (page.value < totalPages.value) {
    page.value++
    load()
  }
}

function newEntry() {
  form.value = { id: null, date: new Date().toISOString().slice(0,10), project: '', hours: 1, notes: '' }
  editing.value = true
}

function editEntry(t) {
  form.value = { ...t }
  editing.value = true
}

function cancel() {
  editing.value = false
}

async function save() {
  try {
    error.value = ''
    if (form.value.id) {
      await api().put('/timesheets/' + form.value.id, form.value)
    } else {
      await api().post('/timesheets', form.value)
    }
    editing.value = false
    await loadAndAdjust()
  } catch (e) {
    error.value = e?.response?.data?.error || 'Save failed'
  }
}

async function delEntry(t) {
  if (!confirm('Delete this entry?')) return
  await api().delete('/timesheets/' + t.id)
  await loadAndAdjust()
}

// After save/delete: if current page becomes empty and isn't the first page, go back one page and reload
async function loadAndAdjust() {
  await load()
  if (rows.value.length === 0 && page.value > 1) {
    page.value--
    await load()
  }
}
</script>
