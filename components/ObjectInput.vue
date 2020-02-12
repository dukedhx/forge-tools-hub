<template>
  <b-message
    :closable="false"
    :title="`${title} ${hasErrors ? '- Correct errors ...' : ''}`"
    :type="
      hasErrors === false ? 'is-success' : hasErrors === true ? 'is-danger' : ''
    "
  >
    <div class="card">
      <div class="card-content">
        <div class="content">
          <div class="columns" v-for="entry in objs">
            <div class="column">
              <b-field
                :type="
                  `${
                    entry.keyMessage === null
                      ? 'is-success'
                      : entry.keyMessage
                      ? 'is-danger'
                      : ''
                  }`
                "
                :label="entry.keyMessage"
                label-position="on-border"
              >
                <b-input
                  :placeholder="entry.placeholder || 'Key'"
                  @input="validate(entry)"
                  v-model="entry.name"
                  expanded
                ></b-input>
                <p class="control">
                  <b-select
                    v-model="entry.type"
                    v-if="entry.type"
                    placeholder="Text"
                  >
                    <option>String</option>
                    <option value="object">Object</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </b-select>
                </p>
              </b-field>
            </div>
            <div class="column">
              <b-field
                :type="
                  `${
                    entry.valueMessage === null
                      ? 'is-success'
                      : entry.valueMessage
                      ? 'is-danger'
                      : ''
                  }`
                "
                :label="entry.valueMessage"
                label-position="on-border"
              >
                <b-input
                  v-if="!entry.values"
                  :placeholder="entry.placeholder || 'Value'"
                  @input="validate(entry)"
                  v-model="entry.value"
                  expanded
                ></b-input>
                <b-taginput
                  v-if="entry.values"
                  v-model="entry.value"
                  :data="entry.values"
                  autocomplete
                  @input="validate(entry)"
                  allow-new
                  open-on-focus
                  :placeholder="entry.placeholder"
                  @add="getFilteredValues(entry)"
                >
                </b-taginput>
                <p class="control">
                  <button
                    v-if="!entry.required"
                    class="button is-primary"
                    @click="remove(entry)"
                  >
                    Delete
                  </button>
                </p>
              </b-field>
            </div>
          </div>
        </div>
      </div>
      <footer class="card-footer">
        <b-button class="card-footer-item" @click="add()">Add</b-button>
        <b-button
          class="card-footer-item"
          @click="update()"
          :disabled="hasErrors"
          >Save</b-button
        >
      </footer>
    </div>
  </b-message>
</template>

<script>
export default {
  methods: {
    reset() {
      this.obj = []
    },
    getFilteredValues(entry) {
      entry.filteredValues = entry.values.filter(
        e => !entry.value instanceof Array || !entry.value.includes(e)
      )
    },

    validateValue(entry, value) {
      value = value || entry.value
      const validator = this.validator || {}
      if (
        validator[entry.name] &&
        !new RegExp(validator[entry.name].regex).test(value)
      )
        entry.valueMessage = validator[entry.name].message
      else if (entry.type == 'object') {
        try {
          JSON.parse((entry.value = value.replace(/'/g, '"')))
          entry.valueMessage = null
        } catch (err) {
          entry.valueMessage = 'Invalid object!'
        }
      } else if (entry.type == 'boolean') {
        const val = (entry.value || '')
          .toString()
          .toLowerCase()
          .trim()
        if (val != 'true' && val != 'false')
          entry.valueMessage = 'Invalid boolean!'
        else entry.valueMessage = null
      } else if (entry.type == 'number') {
        if (isNaN(entry.value) || (entry.value || '').toString().trim() == '')
          entry.valueMessage = 'Invalid number!'
        else entry.value = Number(entry.value)
      } else if (!!!new String(value).trim())
        entry.valueMessage = 'Can not be empty!'
      else entry.valueMessage = null
    },
    validate(entry) {
      if (entry.value instanceof Array) {
        for (let val in entry.value) {
          this.validateValue(entry, val)
          if (entry.valueMessage) break
        }
        if (!entry.value.length) entry.valueMessage = 'Can not be empty!'
      } else this.validateValue(entry)

      if (!entry.name) entry.keyMessage = 'Can not be emptry'
      else entry.keyMessage = null
      this.checkErrors()
    },
    getValue(e) {
      if (e.delimiter && e.value instanceof Array)
        return e.value.join(e.delimiter)
      if (e.type == 'object') return JSON.parse(e.value)
      if (e.type == 'boolean') return e.value == 'true'
      return e.value
    },
    update() {
      this.$emit('update', {
        obj: this.objs
          .filter(e => e.name)
          .reduce(
            (o, e) => Object.assign(o, { [e.name]: this.getValue(e) }),
            {}
          ),
        array: this.objs
      })
    },
    add() {
      this.objs.push({
        name: '',
        value: '',
        type: this.allowType ? 'text' : null
      })
    },
    remove(entry) {
      this.objs = this.objs.filter(e => e != entry)
      if (!this.objs.length) this.hasErrors = false
    },
    checkErrors() {
      return (this.hasErrors = !this.objs.every(
        e => e.name == '' || (e.keyMessage === null && e.valueMessage === null)
      ))
    }
  },
  computed: {
    resetCalled() {
      const shouldReset =
        this.resetTrigger && this.resetTrigger != this.lastReset
      this.lastReset = this.resetTrigger
      if (shouldReset) this.reset()
      return shouldReset
    }
  },
  props: {
    allowType: {
      type: Boolean,
      default: false
    },
    title: {
      type: String
    },
    validator: {
      type: Object
    },
    resetTrigger: {
      type: Number
    },
    defaults: {
      default: ()=>({}),
      type: Object | Array
    }
  },
  mounted() {
    if (this.defaults instanceof Array)
      this.objs = this.defaults.map(e =>
        Object.assign(e, {
          value:
            typeof e.value == 'object' && !e.primitive
              ? JSON.stringify(e.value)
              : (e.primitive?e.value:new String(e.value).value)
        })
      )
    else if (this.defaults)
      this.objs = Object.entries(this.defaults).map(e => ({
        name: e[0],
        value: typeof e[1] == 'object' ? JSON.stringify(e[1]) : e[1]
      }))
    if (this.objs.length) this.objs.forEach(e => this.validate(e))
    else this.add()
  },
  data() {
    return {
      hasErrors: null,
      objs: [],
      lastReset: null
    }
  }
}
</script>
