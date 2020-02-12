<template>
  <Menu style="padding-top:10%"></Menu>
</template>

<script>
import Menu from '../components/Menu'

export default {
  components: { Menu },
  head() {
    return { title: process.env.title + '- Home' }
  },
  name: 'HomePage',

  mounted() {
    this.$store.commit('setTitle', 'Forge Tool Hubs - Home')
  }
}
</script>
