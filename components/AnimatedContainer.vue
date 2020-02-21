<template>
  <section class="animated-section" :style="customStyle">
    <slot></slot>
  </section>
</template>

<style scoped>
.animated-section {
  padding: 0 5px 0 5px;
  left: -200%;
  min-height: calc(100vh - 55px);
  background: rgba(0, 0, 0, 0.3);
  position: absolute;
  width: 100%;
  animation: 1s 0.5s slidein forwards;
}
</style>

<style>
@keyframes slidein {
  to {
    left: 0;
    position: initial;
  }
}
</style>

<script>
  export default{
    props:{
      customStyle:Object,
    }
  }

</script>
