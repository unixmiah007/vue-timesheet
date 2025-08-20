<template>
  <div class="card">
    <h3>Edit Timesheet #{{ id }}</h3>
    <p>For simplicity, use the table's inline buttons on /timesheets to edit/delete.</p>
    <router-link to="/timesheets">← Back</router-link>
  </div>
</template>

<script setup>
defineProps({ id: String })
</script>
