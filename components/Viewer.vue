<template>
  <div class="viewerContainer" ref="viewerContainer"></div>
</template>
<style lang="scss" scoped>
.viewerContainer {
  &::v-deep .adsk-viewing-viewer {
    position: initial !important;
    background: none !important;
  }
}
</style>
<script>
export default {
  methods: {
    checkURN(urn) {
      if (urn.startsWith('http')) return false
      try {
        atob(urn)
        return true
      } catch (err) {
        return false
      }
    },
    terminate() {
      if (this.viewer) this.viewer.finish()
      this.canLoadModel = false
    },
    onError(err) {
      this.$emit('error', err)
    },
    onMessage(message) {
      this.$emit('message', message)
    },
    onModelLoad(modelInfo) {
      this.onMessage(modelInfo)
    },
    loadComplete(event) {
      this.$emit('onLoadComplete', event)
    },
    getCurrentOptions() {
      return Object.assign({}, this.defaultOptions, this.options)
    },

    getLoadModelOptions() {
      const obj = this.getCurrentOptions()
      delete obj.extensions
      return obj
    },
    triggerLoad() {
      if (this.active && this.dependencyLoaded)
        this.canLoadModel ? this.loadModel() : this.loadViewer()
    },
    loadModel(urn, guid) {
      urn = urn || this.urn
      guid = guid || this.guid
      this.loaded.push(urn + guid)
      this.checkURN(urn)
        ? Autodesk.Viewing.Document.load('urn:' + urn, doc =>
            this.viewer
              .loadDocumentNode(
                doc,
                doc.getRoot().search({ guid })[0] ||
                  doc.getRoot().getDefaultGeometry(),
                this.getLoadModelOptions()
              )
              .then(() => this.onModelLoad({ urn, guid }))
              .catch(this.onError)
          )
        : this.viewer.loadModel(
            this.urn,
            this.getLoadModelOptions(),
            () => this.onModelLoad({ urn, guid }),
            this.onError
          )
    },
    loadViewer() {
      if (this.transparentBackground)
        Autodesk.Viewing.Private.InitParametersSetting.alpha = true
      Autodesk.Viewing.Initializer(
        {
          env: this.checkURN(this.urn) ? 'AutodeskProduction' : 'Local',
          accessToken: this.token || 'sb233'
        },
        () => {
          ;(this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
            this.$refs.viewerContainer,
            this.getCurrentOptions()
          )).start()
          if (this.transparentBackground) {
            this.viewer.impl.renderer().setClearAlpha(0)
            this.viewer.impl.glrenderer().setClearColor(0xffffff, 0)
            this.viewer.impl.invalidate(true)
          }
          this.viewer.addEventListener(
            Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            () => this.loadComplete({ urn: this.urn, guid: this.guid })
          )
          this.canLoadModel = true
          this.loadModel()
        }
      )
    }
  },
  watch: {
    active: function(val) {
      this.triggerLoad()
    },
    dependencyLoaded: function(val) {
      this.triggerLoad()
    },
    guid: function(val) {
      if (val) this.triggerLoad()
    },
    urn: function(val) {
      if (val) this.triggerLoad()
    }
  },
  data() {
    return {
      canLoadModel: false,
      dependencyLoaded: false,
      defaultOptions: { keepCurrentModels: true },
      loaded: []
    }
  },
  mounted() {
    Promise.all([
      ...(window.Autodesk
        ? [Promise.resolve()]
        : [
            this.$loadStyle(process.env.viewerStyleURL),
            this.$loadScript(process.env.viewerScriptURL)
          ])
    ])
      .then(() => (this.dependencyLoaded = true))
      .catch(err => this.onError(err))
  },
  beforeDestroy() {
    this.terminate()
  },
  props: {
    guid: {
      type: String
    },
    options: {
      default: {},
      type: Object
    },
    transparentBackground: {
      type: Boolean,
      default: false
    },
    urn: {
      type: String,
      required: true
    },
    token: {
      type: String
    },
    active: {
      type: Boolean,
      required: true
    }
  }
}
</script>
