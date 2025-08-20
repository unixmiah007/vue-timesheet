<template>
  <div class="container">
    <header>
      <h2>Timesheet</h2>
      <NavBar />
    </header>
    <router-view />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>
