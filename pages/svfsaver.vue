<template>
  <animated-container>
    <step-container
      :alertMessage="alertMessage"
      @canProceed="canProceed = $event"
      @stepChange="handleStepChange"
      @reset="reset"
      @urn="handleURNInput"
      @token="token = $event"
      :notificationMessage="notificationMessage"
      :alertDialogMessage="alertDialogMessage"
      :paramInputs="defaultOptions"
      @updateParams="updateOptions"
      paramInputTitle="Viewer Load Options"
      paramControlName="Options"
      :tokenDisabled="tokenDisabled"
      :tokenLoading="tokenLoading"
      :urnLoading="awaitingServiceWorker"
      @guid="guid = $event"
      allowParamInputType
      showGuid
    >
      <b-step-item
        label="Viewer"
        class="viewerContainer"
        :visible="canProceed"
        :clickable="canProceed"
        :type="{ 'is-success': canLoadViewer, 'is-warning': !canLoadViewer }"
      >
        <Viewer
          v-if="canLoadViewer"
          :active="startViewerLoading"
          :urn="urn"
          :guid="guid"
          :token="token"
          @onLoadComplete="viewerLoadComplete"
          transparentBackground
          :options="options"
        ></Viewer>
        <b-loading
          :is-full-page="false"
          :active.sync="isViewerLoading"
          :can-cancel="false"
        ></b-loading>
      </b-step-item>
      <b-step-item
        label="Download"
        :visible="downloadReady"
        :clickable="downloadReady"
        :type="{ 'is-success': downloadReady, 'is-warning': !downloadReady }"
      >
        <div class="has-text-centered">
          <b-button size="is-large" @click="download" icon-left="download">
            Download
          </b-button>
        </div>
      </b-step-item>
    </step-container>
  </animated-container>
</template>
<style scoped>
.viewerContainer {
  position: relative;
  height: 70vh;
}
</style>
<script>
import AnimatedContainer from '../components/AnimatedContainer'
import Viewer from '../components/Viewer'
import Zip from '../plugins/ZipHelper'
import StepContainer from '../components/StepContainer'
import ServiceWorkerClient from '../plugins/ServiceWorkerClient'
import tools from '../plugins/Tools'
const defaultOptions = { extensions: ['Autodesk.DocumentBrowser'] }
export default {
  head() {
    return { title: process.env.title + '- SVF Downloader' }
  },
  components: { Viewer, StepContainer, AnimatedContainer },
  methods: {
    reset() {
      this.isViewerLoading = true
      this.downloadReady = false
      this.startViewerLoading = false
      this.options = null
      this.awaitingServiceWorker = false
      this.canLoadViewer = false
    },
    download() {
      this.zip.download()
    },
    updateOptions({ obj, array }) {
      this.options = obj
      this.defaultOptions = array
    },
    showAlertMessage(message) {
      this.alertMessage = tools.getMessageObject(message)
    },
    showNotification(message) {
      this.notificationMessage = tools.getMessageObject(message)
    },
    handleURNInput(urn) {
      this.urn = urn
      this.startViewerLoading = false
    },
    handleStepChange(index) {
      if (index == 2) {
        if (!this.startViewerLoading) {
          this.showNotification({ message: 'Passing URN to service worker...' })
          try {
            this.isViewerLoading = true
            this.canLoadViewer = true
            this.awaitingServiceWorker = true
            this.serviceWorkerClient.postMessage({
              operation: 'fetchURNBlob',
              urn: this.urn
            })
          } catch (err) {
            this.showAlertMessage(err)
          }
        }
      }
    },
    viewerLoadComplete() {
      this.isViewerLoading = false
      this.downloadReady = true
      this.showNotification({
        message: 'Click to download the SVF archive',
        actionText: 'Download',
        onAction: () => this.download()
      })
    }
  },

  async mounted() {
    this.$store.commit('setTitle', 'Download SVF')

    this.zip = new Zip()
    try {
      this.showNotification({ message: 'Preparing service worker...' })
      this.serviceWorkerClient = new ServiceWorkerClient()
      await this.serviceWorkerClient.init()

      this.serviceWorkerClient.onMessageEvent(({ operation, data }) => {
        if (operation == 'ackURN') {
          this.awaitingServiceWorker = false
          this.showNotification('Downloading SVF - Please wait ...')
          this.startViewerLoading = true
        }
        if (operation == 'URNBlob') this.zip.addFile(data.name, data.payload)
      })
      this.tokenDisabled = this.tokenLoading = false
      this.showNotification({ message: 'Service worker ready...' })
    } catch (err) {
      this.showAlertMessage(err)
      this.showNotification(
        'There was an error activating the Service Worker - try refresh the page and see if that fixes it ...'
      )
    }
  },
  computed: {},
  data() {
    return {
      serviceWorkerClient: null,
      awaitingServiceWorker: false,
      defaultOptions: Object.entries(defaultOptions).map(e => ({
        name: e[0],
        value: e[1],
        type: typeof e[1]
      })),
      options: defaultOptions,
      tokenLoading: true,
      tokenDisabled: true,
      canLoadViewer: false,
      zip: null,
      isViewerLoading: true,
      startViewerLoading: false,
      downloadReady: false,
      notificationMessage: {},
      alertDialogMessage: {},
      token: '',
      guid: '',
      urn: '',
      alertMessage: {},
      canProceed: false,
      processNextMessage: '- Click next to proceed'
    }
  }
}
</script>
