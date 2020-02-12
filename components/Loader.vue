<template>
  <div class="loader-container" :style="styles">
    <b-loading
      :is-full-page="false"
      :active="true"
      :can-cancel="false"
    ></b-loading>
  </div>
</template>
<style scoped>
.loader-container {
  position: relative;
}
</style>
<script>
export default {
  computed: {
    styles() {
      return {
        height: this.height,
        width: this.width
      }
    }
  },
  props: {
    height: { type: String, default: '50px' },
    width: { type: String, default: '100%' }
  }
}
</script>
