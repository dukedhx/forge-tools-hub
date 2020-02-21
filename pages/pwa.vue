<template>
  <animated-container>
    <b-tabs
      class="customcolor"
      position="is-right"
      v-model="activeTab"
      type="is-toggle"
    >
      <b-tab-item label="Save">
        <step-container
          :alertMessage="alertMessage"
          :step="loadViewStep"
          @canProceed="canProceed = $event"
          @stepChange="handleStepChange"
          @reset="reset"
          @urn="handleURNInput"
          @token="token = $event"
          @guid="handleGUIDInput"
          :confirmDialogueMessage="confirmDialogueMessage"
          :notificationMessage="notificationMessage"
          :alertDialogMessage="alertDialogMessage"
          :paramInputs="defaultOptions"
          @loadButtonPressed="loadButtonPressed"
          loadButtonTitle="Load"
          @updateParams="updateOptions"
          paramInputTitle="Viewer Load Options"
          paramControlName="Options"
          :tokenDisabled="awaitingServiceWorker"
          :tokenLoading="awaitingServiceWorker"
          showGuid
          allowParamInputType
        >
          <b-step-item
            label="Viewer"
            class="viewerContainer"
            :visible="canProceed"
            :clickable="canProceed"
            :type="{ 'is-success': canProceed, 'is-warning': !canProceed }"
          >
            <Viewer
              v-if="loadViewerVisible && (loadViewerVisible = canProceed)"
              :active="startViewerLoading"
              :urn="urn"
              :guid="guid"
              :token="token"
              @onLoadComplete="viewerLoadComplete"
              :transparentBackground="transparentBackground"
              :options="options"
            ></Viewer>
            <b-loading
              :is-full-page="false"
              :active.sync="isViewerLoading"
              :can-cancel="false"
            ></b-loading>
          </b-step-item>
          <pwa-help></pwa-help>
        </step-container>
      </b-tab-item>
      <b-tab-item label="Load">
        <step-container
          @reset="reset"
          :step="cacheViewStep"
          @stepChange="handleStepChange"
          :paramInputs="defaultOptions"
          @updateParams="updateOptions"
          paramInputTitle="Viewer Load Options"
          paramControlName="Options"
          :urnLoading="awaitingServiceWorker"
          :showURN="false"
          :showToken="false"
          allowParamInputType
        >
          <b-step-item
            label="Load Settings"
            :type="{
              'is-success': canCacheLoadViewer,
              'is-warning': !canCacheLoadViewer
            }"
          >
            <b-message
              title="Load/Manage Cache Views"
              :closable="false"
              :type="`${canCacheLoadViewer ? 'is-success' : 'is-warning'}`"
            >
              <b-field
                label="Model URN/URL"
                label-position="on-border"
                :type="`${loadURNValid ? 'is-success' : 'is-danger'}`"
              >
                <b-autocomplete
                  :disabled="awaitingServiceWorker"
                  :loading="awaitingServiceWorker"
                  open-on-focus
                  @input="viewChange"
                  placeholder="Content type goes here ..."
                  :data="cachedViewNames"
                  v-model="loadurn"
                  expanded
                ></b-autocomplete>
                <p class="control" v-if="loadURNValid">
                  <b-select
                    v-model="viewAction"
                    @input="viewActionChanged"
                    placeholder="Action"
                  >
                    <option value="">No Action</option>
                    <option value="delete" :disabled="!loadURNValid"
                      >Delete</option
                    >
                    <option value="clear" :disabled="!cachedViewNames.length"
                      >Clear All</option
                    >
                  </b-select>
                </p>
              </b-field>
              <b-field
                v-if="loadURNValid"
                label="Model GUID"
                label-position="on-border"
                :type="`${loadGuidValid ? 'is-success' : 'is-danger'}`"
              >
                <b-autocomplete
                  open-on-focus
                  @input="viewChange"
                  placeholder="Content type goes here ..."
                  :data="cachedViewGuids"
                  v-model="loadguid"
                  expanded
                ></b-autocomplete>
              </b-field>
              <b-message title="Current Load Options" :closable="false">
                <pre>{{ options }}</pre>
              </b-message>
            </b-message>
          </b-step-item>
          <b-step-item
            label="Viewer"
            class="viewerContainer"
            :visible="cacheLoadVisible"
            :clickable="cacheLoadVisible"
            :type="{
              'is-success': canCacheLoadViewer,
              'is-warning': !canCacheLoadViewer
            }"
          >
            <Viewer
              v-if="cacheViewerVisible"
              :active="startViewerLoading"
              :urn="loadurn"
              :guid="loadguid"
              :transparentBackground="transparentBackground"
              :options="options"
            ></Viewer>
          </b-step-item>

          <pwa-help></pwa-help>
        </step-container>
      </b-tab-item>
    </b-tabs>
  </animated-container>
</template>
<style scoped>
.customcolor ::v-deep ul a {
  color: #fff;
  border-color: #ffdd57 !important;
}
.customcolor ::v-deep ul a:hover {
  color: #4a4a4a !important;
  background-color: #ffdd57 !important;
}
.customcolor ::v-deep ul .is-active a {
  color: #4a4a4a !important;
  background-color: #ffdd57 !important;
}
.viewerContainer {
  position: relative;
  height: 70vh;
}
</style>
<script>
import Vue from 'vue'
import AnimatedContainer from '../components/AnimatedContainer'
import Viewer from '../components/Viewer'
import Zip from '../plugins/ZipHelper'
import StepContainer from '../components/StepContainer'
import ServiceWorkerClient from '../plugins/ServiceWorkerClient'
import tools from '../plugins/Tools'
const PwaHelp = Vue.component('PwaHelp', {
  template: `
             <template slot='help-content'>

              <section>
                - See screencast <a href="http://tiny.cc/ndxujz" target='_blank'>here</a> for step by step instructions for the PWA tool ...
              </section>
              </template>`
})
const defaultOptions = {
  extensions: ['Autodesk.DocumentBrowser'],
  transparentBackground: true
}
const viewObjectName = 'sb233.CachedViews'
export default {
  head() {
    return { title: process.env.title + '- Viewer PWA' }
  },

  components: { Viewer, StepContainer, AnimatedContainer, PwaHelp },
  methods: {
    reset() {
      this.isViewerLoading = true
      this.currentView = null
      this.startViewerLoading = false
      this.loadViewerVisible = false
      this.cacheViewerVisible = false
      this.loadurn = ''
      this.loadguid = ''
      this.options = defaultOptions
      this.awaitingServiceWorker = false
      this.startCacheLoading = false
      this.cacheViewStep = 0
    },
    loadButtonPressed() {
      this.startCacheLoading = true
      this.loadViewStep = 2
    },
    addCurrentView() {
      const views = Object.assign({}, this.cachedViews)
      views[this.urn] = Object.assign(this.cachedViews[this.urn] || {}, {
        [this.guid || 'default']: this.options
      })
      this.cachedViews = views
      this.saveView()
    },
    viewChange() {
      this.startViewerLoading = false
      this.options =
        (this.cachedViews[this.loadurn] || {})[this.loadguid || 'default'] ||
        defaultOptions
    },

    viewActionChanged() {
      if (this.viewAction == 'delete') {
        this.showConfirmation({
          title: 'Delete this view?',
          message: this.loadurn,
          onAction: () => {
            this.serviceWorkerClient.postMessage({
              operation: 'unregisterRoute',
              name: this.loadurn
            })
            const views = Object.assign({}, this.cachedViews)
            delete views[this.loadurn]
            this.cachedViews = views
            this.loadurn = ''
            this.loadguid = ''
            this.saveView()
          }
        })
      }
      if (this.viewAction == 'clear') {
        this.showConfirmation({
          message: 'Clear all cached contents?',
          onAction: () => {
            this.cachedViewNames.forEach(e =>
              this.serviceWorkerClient.postMessage({
                operation: 'unregisterRoute',
                name: e
              })
            )
            this.cachedViews = {}
            this.serviceWorkerClient.postMessage({
              operation: 'unregisterViewer'
            })
            this.serviceWorkerClient.postMessage({
              operation: 'registerViewer'
            })
            localStorage.removeItem(viewObjectName)
          }
        })
      }
      this.viewAction = ''
    },
    saveView() {
      localStorage.setItem(viewObjectName, JSON.stringify(this.cachedViews))
    },
    updateOptions({ obj }) {
      this.options = obj
    },
    showAlertMessage(message) {
      this.alertMessage = tools.getMessageObject(message)
    },
    showNotification(message) {
      this.notificationMessage = tools.getMessageObject(message)
    },
    showConfirmation(message) {
      this.confirmDialogueMessage = tools.getMessageObject(message)
    },
    handleURNInput(urn) {
      this.urn = urn
      this.startCacheLoading = !this.loadViewerVisible
      this.startViewerLoading = false
    },
    handleGUIDInput(guid) {
      this.guid = guid
      this.startCacheLoading = !this.loadViewerVisible
      this.startViewerLoading = false
    },
    handleStepChange(index) {
      setTimeout(() => (this.loadViewStep = -1), 1000)
      if (index == 2 || (index == 1 && this.activeTab == 1)) {
        if (!this.startViewerLoading) {
          try {
            let path
            if (index == 2 && this.startCacheLoading) {
              this.loadViewerVisible = true
              path = this.urn
            } else if (
              index == 1 &&
              this.activeTab == 1 &&
              this.canCacheLoadViewer
            ) {
              this.cacheViewerVisible = true
              path = this.loadurn
            }

            if (path) {
              this.awaitingServiceWorker = true
              this.isViewerLoading = true
              this.showNotification('Passing URN to service worker...')
              this.serviceWorkerClient.postMessage(
                this.svfPath(path)
                  ? { operation: 'registerRoute', route: this.svfPath(path) }
                  : { operation: 'registerURN', urn: path }
              )
            }
          } catch (err) {
            this.showAlertMessage(err)
          }
        }
      }
    },
    svfPath(path) {
      try {
        return new URL('../', this.urn).href
      } catch (err) {
        return ''
      }
    },
    viewerLoadComplete() {
      this.isViewerLoading = false

      this.addCurrentView()

      this.showNotification('Cache completed!')
    }
  },

  async mounted() {
    this.$store.commit('setTitle', 'Viewer PWA - Load and view models offline')

    try {
      this.cachedViews = JSON.parse(
        localStorage.getItem(viewObjectName) || '{}'
      )
      this.serviceWorkerClient = new ServiceWorkerClient()
      this.showNotification('Preparing service worker...')
      this.awaitingServiceWorker = true
      await this.serviceWorkerClient.init()
      this.serviceWorkerClient.postMessage({ operation: 'registerViewer' })
      this.serviceWorkerClient.onMessageEvent(({ operation, data }) => {
        // console.log(operation,data);
        if (operation == 'ackURN' || operation == 'ackRoute') {
          this.awaitingServiceWorker = false
          this.startViewerLoading = true
          this.showNotification('Loading model ...')
        }
      })
      this.awaitingServiceWorker = false
      this.showNotification('Service worker ready...')
    } catch (err) {
      this.showAlertMessage(err)
      this.showNotification(
        'There was an error activating the Service Worker - try refresh the page and see if that fixes it ...'
      )
    }
  },
  computed: {
    transparentBackground() {
      return this.options.transparentBackground !== false
    },
    defaultOptions() {
      return Object.entries(this.options).map(e => ({
        name: e[0],
        value: e[1],
        type: typeof e[1]
      }))
    },

    loadURNValid() {
      return this.cachedViewNames.includes(this.loadurn)
    },
    loadGuidValid() {
      return !this.loadguid || this.cachedViewGuids.includes(this.loadguid)
    },
    canCacheLoadViewer() {
      return this.loadURNValid && this.loadGuidValid
    },
    cacheLoadVisible() {
      return this.cacheViewerVisible || this.canCacheLoadViewer
    },
    cachedViewNames() {
      return Object.keys(this.cachedViews)
    },
    cachedViewGuids() {
      return Object.keys(this.cachedViews[this.loadurn] || {})
    }
  },
  data() {
    return {
      serviceWorkerClient: null,
      awaitingServiceWorker: false,
      loadViewStep: -1,
      cacheViewStep: -1,
      startCacheLoading: false,
      options: defaultOptions,
      cachedViews: {},
      isViewerLoading: true,
      startViewerLoading: false,
      cacheViewerVisible: false,
      loadViewerVisible: false,
      notificationMessage: {},
      alertDialogMessage: {},
      resetCacheView: 0,
      resetLoadView: 0,
      guid: '',
      loadurn: '',
      loadguid: '',
      activeTab: 0,
      token: '',
      urn: '',
      alertMessage: {},
      confirmDialogueMessage: {},
      viewAction: null,
      canProceed: false,
      processNextMessage: '- Click next to proceed'
    }
  }
}
</script>
