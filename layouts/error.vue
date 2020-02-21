<template>
  <animated-container>
    <b-message
      class="errorMessage"
      :closable="false"
      type="is-danger"
      title="Error occurred!"
    >
      <h1 v-if="error.statusCode === 404">Page not found</h1>
      <section v-else>
        <h1>An error occurred:</h1>
        <pre>{{ error }}</pre>
      </section>
      <nuxt-link to="/">Go Home</nuxt-link> |
      <a href="https://github.com/dukedhx/forge-tools-hub" target="_blank"
        >Contact Admin</a
      >
    </b-message>
  </animated-container>
</template>
<style lang="scss" scoped>
.errorMessage {
  &::v-deep .media-content {
    width: 100%;
  }
}
</style>
<script>
import AnimatedContainer from '../components/AnimatedContainer'

export default {
  components: { AnimatedContainer },

  head() {
    return { title: process.env.title + '- Error' }
  },
  mounted() {
    this.$store.commit('setTitle', 'Error')
  },
  props: ['error']
}
</script>
