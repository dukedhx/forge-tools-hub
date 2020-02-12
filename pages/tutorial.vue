<template>
  <animated-container>
  <b-message :closable="false" type="is-danger" title="Error occurred!">
    <section><h1>Coming soon ...</h1></section>
    <nuxt-link to="/">Go Home</nuxt-link> | <a href="https://github.com/dukedhx/forge-tools-hub" target='_blank'>Contact Admin</a>
  </b-message>
  </animated-container>
</template>

<script>
import AnimatedContainer from '../components/AnimatedContainer'

export default {
  components: { AnimatedContainer, },

  head(){
    return { title: process.env.title + '- Error' }
  },
  mounted(){
    this.$store.commit('setTitle', 'Error')
  },
  props: ['error'],
}
</script>