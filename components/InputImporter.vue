<template>
  <b-message
    :title="title"
    :closable="false"
    :type="`${success ? 'is-success' : hasError ? 'is-danger' : 'is-warning'}`"
  >
    <b-field
      :label="`${hasError ? 'Invalid input!' : 'Template Body'}`"
      label-position="on-border"
    >
      <b-input
        :placeholder="placeholder"
        v-model="input"
        type="textarea"
        expanded
      ></b-input>
      <p class="control">
        <b-button class="importControl" @click="$emit('update', importObject)"
          >Apply</b-button
        >
      </p>
    </b-field>

    <json-viewer
      boxed
      :value="importObject"
      :expand-depth="3"
      v-if="this.type == 'json' && importObject != null"
    ></json-viewer>
    <pre v-if="this.type != 'json' && importObject != null"></pre>
  </b-message>
</template>
<style scoped>
.importControl {
  height: 100%;
}
</style>
<script>
export default {
  props: {
    placeholder: {
      type: String
    },
    converter: {
      type: Object
    },
    title: {
      type: String
    }
  },
  computed: {
    success() {
      return !!this.input && !!!this.hasError
    },
    type() {
      return (this.converter && this.converter.type) || 'json'
    },
    importObject() {
      if (!this.input) return {}
      try {
        return (this.converter || JSON).parse(this.input)
      } catch (exp) {
        return null
      }
    },
    hasError() {
      return this.importObject == null
    }
  },
  data() {
    return {
      input: null
    }
  }
}
</script>
