<template>
  <animated-container>
    <step-container
      :alertMessage="alertMessage"
      @canProceed="canProceed = $event"
      @stepChange="handleStepChange"
      @reset="reset"
      :alertDialogMessage="alertDialogMessage"
      :notificationMessage="notificationMessage"
      @token="token = $event"
      @urn="urn = $event"
    >
      <b-step-item
        label="Manifest"
        :visible="canProceed"
        :clickable="canProceed"
        :type="{
          'is-success': canStartDownload,
          'is-warning': !canStartDownload,
          'is-danger': !canStartDownload && hasError
        }"
      >
        <b-message
          :title="
            `Derivative GUID ${canStartDownload ? processNextMessage : ''}`
          "
          :closable="false"
          :type="`${canStartDownload ? 'is-success' : 'is-warning'}`"
        >
          <b-autocomplete
            :placeholder="
              `${
                isManifestSuccess
                  ? 'Enter GUID of the derivative to download ...'
                  : 'Loading manifest ...'
              }`
            "
            :data="manifestDerivativeChildren"
            field="guid"
            v-model="derivativeGUID"
            :loading="!isManifestSuccess"
            expanded
          >
            <template slot="empty">No results found</template>
          </b-autocomplete>
        </b-message>
        <json-viewer
          boxed
          :value="manifestDerivatives"
          :expand-depth="3"
          v-if="isManifestSuccess"
        ></json-viewer>
        <loader v-if="isManifestLoading"></loader>
      </b-step-item>
      <b-step-item
        label="Download"
        :visible="canStartDownload"
        :clickable="canStartDownload"
        :type="{
          'is-success': downloadReady,
          'is-warning': !downloadReady,
          'is-danger': hasError
        }"
      >
        <b-message
          :title="`${downloadReady ? 'Success!' : 'Downloading ...'}`"
          :closable="false"
          :type="`${downloadReady ? `is-success` : `is-warning`}`"
        >
          <div class="has-text-centered">
            <b-button
              :loading="downloading"
              type="is-text"
              v-if="downloading"
            ></b-button
            ><b-button
              @click="download"
              :icon-left="`${downloading ? 'close-circle' : 'download'}`"
              :disabled="downloadDisabled"
            >
              {{ downloading ? 'Cancel' : 'Download' }}
            </b-button>
          </div>
        </b-message>
        <b-progress
          class="progress"
          :value="(saved / toSave) * 100"
          show-value
          :type="
            `${
              downloadReady ? 'is-success' : hasError ? 'is-danger' : 'is-info'
            }`
          "
        >
          {{ processed != toSave ? 'Downloading - ' : '' }} Completed:
          {{ saved }} out of {{ toSave }}
        </b-progress>
        <b-table class="data-table" :data="urnTableData">
          <template slot-scope="props">
            <b-table-column field="urn" label="URN">
              {{ props.row.urn }}
            </b-table-column>
            <b-table-column field="status" label="Status">
              <b-tooltip
                :label="
                  `${
                    props.row.status == -1
                      ? 'Error! Click for details'
                      : props.row.status == 0
                      ? 'Loading ...'
                      : 'Completed'
                  }`
                "
                :type="
                  `${
                    props.row.status == -1
                      ? 'is-danger'
                      : props.row.status == 0
                      ? 'is-light'
                      : 'is-success'
                  }`
                "
              >
                <b-icon
                  v-if="props.row.status == 1"
                  icon="check-circle"
                  type="is-success"
                ></b-icon>
                <b-button
                  v-if="props.row.status == -1"
                  @click="showAlertDialogue(props.row.message)"
                  type="is-text"
                  ><b-icon
                    icon="close-circle"
                    v-if="props.row.status == -1"
                    type="is-danger"
                  ></b-icon
                ></b-button>
                <b-button
                  v-if="props.row.status == 0"
                  type="is-text"
                  loading
                ></b-button>
              </b-tooltip>
            </b-table-column>
          </template>
        </b-table>
      </b-step-item>
      <template slot="help-content">
        <section>
          - See screencast
          <a href="http://tiny.cc/7cxujz" target="_blank">here</a> for step by
          step instructions for the Derivatives tool ...
        </section></template
      >
    </step-container>
  </animated-container>
</template>
<style scoped>
.data-table ::v-deep td {
  word-break: break-all;
}
</style>
<script>
import AnimatedContainer from '../components/AnimatedContainer'

import ServiceClient from '../components/ServiceClient'
import Zip from '../components/ZipHelper'
import 'vue-json-viewer/style.css'
import tools from '../components/Tools'
import Loader from '../components/Loader'
import StepContainer from '../components/StepContainer'
export default {
  components: { StepContainer, Loader, AnimatedContainer },
  head() {
    return { title: process.env.title + '- Download Derivatives' }
  },
  mounted() {
    this.$store.commit('setTitle', 'Download Derivatives')
  },
  methods: {
    reset() {
      if (this.ServiceClient) this.ServiceClient.terminate()
      this.zip = null
      this.urnTableData = null
      this.ServiceClient = null
      this.derivativeGUID = ''
      this.manifest = null
      this.hasError = false
      this.downloadReady = false
      this.isManifestLoading = false
      this.isDownloadingDerivatives = false
      this.downloadDisabled = false
      this.urnTableData = []
    },
    async download() {
      try {
        if (this.downloadReady) {
          this.downloading = true
          await this.zip.download()
        } else {
          this.ServiceClient.terminate()
          this.showNotification(
            'Fetch cancelled! But you can still download the saved derivatives...'
          )
        }
      } catch (err) {
        this.showAlertMessage(err)
      } finally {
        this.downloading = this.downloadDisabled = false
      }
    },
    showNotification(message) {
      this.notificationMessage = tools.getMessageObject(message)
    },
    showAlertDialogue(message) {
      this.alertDialogMessage = tools.getMessageObject(message.toString())
    },
    showAlertMessage(message) {
      this.hasError = true
      this.alertMessage = tools.getMessageObject(message.toString())
    },
    handleStepChange(index) {
      switch (index) {
        case 2:
          if (!this.isManifestLoading && !this.manifestDerivatives.length) {
            this.ServiceClient =
              this.ServiceClient ||
              new ServiceClient({ axios: this.$axios, token: this.token })
            this.loadManifest()
            this.showNotification('Parsing manifest - Please wait ...')
          }
          break
        case 3:
          if (!this.downloadReady && !this.isDownloadingDerivatives) {
            this.downloadDerivatives()
            this.showNotification(
              `Downloading ${this.derivativeGUID} - Please wait ...`
            )
          }
      }
    },
    async loadManifest() {
      try {
        this.isManifestLoading = true
        this.manifest = await this.ServiceClient.getManifest(this.urn)
        this.isManifestLoading = false
        if (!this.isManifestSuccess)
          this.showAlertMessage('Derivative not ready for download!')
      } catch (err) {
        this.showAlertMessage(err)
      }
    },
    findURNTableEntry(urn) {
      return this.urnTableData.find(e => e.urn == urn)
    },
    processDownloadResult(urn, promise) {
      this.urnTableData.push({ urn, status: 0 })
      return promise
        .then(async e => {
          if (tools.getExtension(urn) == 'svf')
            (await this.ServiceClient.getSVFAssets(e.data, urn)).forEach(e =>
              this.processDownloadResult(
                e,
                this.ServiceClient.getDerivativesAsync(this.urn, e)
              )
            )
          this.zip.addFile(
            urn
              .split('/')
              .slice(1)
              .map(e => decodeURIComponent(e))
              .join('/'),
            e.data
          )
          this.findURNTableEntry(urn).status = 1
        })
        .catch(err => {
          const entry = this.findURNTableEntry(urn)
          entry.status = -1
          entry.message = err
        })
        .finally(() => {
          if (this.processed == this.toSave) {
            const component = this
            if ((this.downloadReady = this.saved == this.toSave))
              this.showNotification({
                message: 'Click to download the archived derivatives',
                actionText: 'Download',
                onAction: () => component.download()
              })
            else {
              this.showAlertMessage(
                'Error occured! You can still download the saved derivatives - click error icons of failed downloads for details ...'
              )
            }
            this.downloading = false
          }
        })
    },
    downloadDerivatives() {
      try {
        this.isDownloadingDerivatives = true
        this.zip = new Zip()
        this.manifestDerivativeChildren
          .find(e => e.guid == this.derivativeGUID)
          .children.forEach(e => {
            if (e.urn)
              this.processDownloadResult(
                e.urn,
                this.ServiceClient.getDerivativesAsync(this.urn, e.urn)
              )
          })
        this.downloading = true
      } catch (err) {
        console.log(err)
        this.showAlertMessage(err)
      }
    }
  },
  computed: {
    toSave: {
      set: () => {},
      get: function() {
        return this.urnTableData.length
      }
    },
    saved: {
      set: () => {},

      get: function() {
        return this.urnTableData.filter(e => e.status == 1).length
      }
    },
    downloadDisabled: {
      set: () => {},
      get: function() {
        return !this.downloading && this.saved == 0
      }
    },
    processed: {
      set: () => {},

      get: function() {
        return this.urnTableData.filter(e => e.status != 0).length
      }
    },
    canStartDownload() {
      return !!this.derivativeGUID
    },

    isManifestSuccess() {
      return (
        !!this.manifest &&
        this.manifest.status == 'success' &&
        this.manifest.progress == 'complete' &&
        this.manifest.derivatives instanceof Array
      )
    },
    manifestDerivatives() {
      return this.isManifestSuccess ? this.manifest.derivatives : []
    },
    manifestDerivativeChildren() {
      return this.isManifestSuccess
        ? this.manifest.derivatives.flatMap(e =>
            (e.children || []).flatMap(e => e)
          )
        : []
    }
  },
  data() {
    return {
      urnTableData: [],
      manifest: null,
      zip: null,
      isManifestLoading: false,
      isDownloadingDerivatives: false,
      downloadReady: false,
      downloading: false,
      hasError: false,
      canProceed: false,
      alertDialogMessage: {},
      notificationMessage: {},
      token: '',
      urn: '',
      alertMessage: {},
      derivativeGUID: '',
      processNextMessage: '- Click next to proceed'
    }
  }
}
</script>
