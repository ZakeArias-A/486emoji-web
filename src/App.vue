<script setup lang="ts">

</script>

<template>
  <vs-button :active="active == 0" @click="active = 0"> Active </vs-button>
  <vs-button :active="active == 1" @click="active = 1"> Default </vs-button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
