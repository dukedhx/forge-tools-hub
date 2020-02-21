<template>
  <animated-container>
    <step-container
      :alertMessage.sync="alertMessage"
      @updateParams="customHeaders = $event.obj"
      paramControlName="Headers"
      paramInputTitle="Custom Headers"
      :paramInputs="customHeaders"
      @canProceed="canProceed = $event"
      @stepChange="handleStepChange"
      @reset="reset"
      @urn="urn = $event"
      @token="token = $event"
      urnTitleText="Derivative URN or Full URL"
      urnLabelText="URN/URL"
      :notificationMessage="notificationMessage"
      :alertDialogMessage="alertDialogMessage"
      paramImportPlaceholder='Import Postman v2 request here ... e.g. {header:[...],body:{...},url:"https://..."}'
      paramImportTitle="Import Request Template"
      @updateImport="handleParamImport"
    >
      <b-step-item
        label="Chunk Length"
        :visible="canProceed"
        :clickable="canProceed"
        :type="{
          'is-success': canStartDownload,
          'is-warning': !canStartDownload,
          'is-danger': !canStartDownload
        }"
      >
        <b-message
          :title="`Chunk Length ${canStartDownload ? processNextMessage : ''}`"
          :closable="false"
          :type="`${canStartDownload ? 'is-success' : 'is-warning'}`"
        >
          <b-field
            :type="`${chunklengthValid ? 'is-success' : 'is-danger'}`"
            :message="
              `${
                chunklengthValid
                  ? `Download will proceed in chunks of ${chunklength} MB ...`
                  : 'Put in an zero or postive integer smaller than the content length ...'
              }`
            "
          >
            <b-input
              placeholder="Enter chunk size in MB to download in chunks or 0 for non-partial download ..."
              @input="handleChunkInput"
              v-model="chunklength"
              :loading="!isHeaderSuccess"
              expanded
            ></b-input>
          </b-field>
          <b-field
            v-if="showContentLengthInput && !isHeaderLoading"
            :type="`${isContentLengthValid ? 'is-success' : 'is-danger'}`"
            :message="
              `Size of object to download: ${headerObject['content-length']} bytes`
            "
          >
            <b-input
              placeholder="Could not properly retrieve content length - enter in bytes manually here ..."
              v-model="contentLength"
              @input="handleInputContentLength"
              expanded
            ></b-input>
          </b-field>
        </b-message>
        <b-message :type="`${isHeaderSuccess ? 'is-success' : 'is-warning'}`">
          <loader v-if="!isHeaderSuccess"></loader>
          <json-viewer
            boxed
            :value="headers"
            :expand-depth="3"
            v-if="isHeaderSuccess"
          ></json-viewer>
        </b-message>
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
          class="progressbar"
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
        <b-table class="data-table" :data="downloadTableData">
          <template slot-scope="props">
            <b-table-column field="range" label="Range">
              {{ props.row.range }}
            </b-table-column>
            <b-table-column field="size" label="Size">
              {{ props.row.size }}
            </b-table-column>
            <b-table-column field="status" label="Status">
              <b-tooltip
                :label="
                  `${
                    props.row.status == -1
                      ? 'Error! Click for details'
                      : props.row.status == 0
                      ? 'Loading ...'
                      : 'Click to download this chunk'
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
                <a
                  :href="getObjectURL(props.row.data)"
                  v-if="props.row.status == 1"
                  :download="`part.${props.index}`"
                  type="is-text"
                  ><b-icon icon="download" type="is-success"></b-icon
                ></a>
                <a
                  v-if="props.row.status == -1"
                  @click="showAlertDialogue(props.row.message)"
                  type="is-text"
                  ><b-icon
                    icon="close-circle"
                    v-if="props.row.status == -1"
                    type="is-danger"
                  ></b-icon
                ></a>
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
          <a href="http://tiny.cc/scxujz" target="_blank">here</a> for step by
          step instructions for the Downloader tool ...
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
import ServiceClient from '../plugins/ServiceClient'
import StepContainer from '../components/StepContainer'
import Loader from '../components/Loader'
import tools from '../plugins/Tools'
import 'vue-json-viewer/style.css'
const defaultHeaders = { Range: 'bytes=:start-:end' }
export default {
  head() {
    return { title: process.env.title + '- Download Tool' }
  },
  mounted() {
    this.$store.commit(
      'setTitle',
      'Download Forge Derivatives (or anything else)'
    )
  },
  components: { StepContainer, Loader, AnimatedContainer },
  methods: {
    reset() {
      if (this.ServiceClient) this.ServiceClient.terminate()
      this.headers = {}
      this.customHeaders = defaultHeaders
      this.isHeaderLoading = false
      this.hasError = false
      this.downloadReady = false
      this.downloading = false
      this.downloadTableData = []
      this.chunklength = undefined
      this.contentLength = undefined
      this.showContentLengthInput = false
    },
    handleParamImport(event) {
      if (event.header)
        this.customHeaders = event.header.reduce(
          (o, e) => Object.assign(o, { [e.key]: e.value }),
          {}
        )
    },
    getObjectURL(blob) {
      return window.URL.createObjectURL(blob)
    },
    handleStepChange(index) {
      switch (index) {
        case 2:
          if (!this.isHeaderLoading && !this.isHeaderSuccess) {
            this.ServiceClient =
              this.ServiceClient ||
              new ServiceClient({ axios: this.$axios, token: this.token })

            this.loadHeader()
          }
          break
        case 3:
          if (!this.downloading && !this.downloadReady) this.downloadURN()
      }
    },
    showAlertMessage(message) {
      this.alertMessage = tools.getMessageObject(message)
    },
    async loadHeader() {
      try {
        this.isHeaderLoading = true
        this.headerObject = Object.assign(
          {},
          await this.ServiceClient[
            this.urn.startsWith('urn') ? 'getDerivativeInfo' : 'getInfo'
          ](this.urn, this.customHeaders)
        )
        this.headers = Object.assign({}, this.headerObject)
      } catch (err) {
        this.showAlertMessage(err)
      } finally {
        this.contentLength = this.headerObject['content-length']
        this.showContentLengthInput = !this.isContentLengthValid
        this.isHeaderLoading = false
      }
    },
    handleChunkInput(length) {
      if (this.chunklengthValid) this.chunklength = Math.floor(length)
    },
    showAlertDialogue(message) {
      this.alertDialogMessage = tools.getMessageObject(message.toString())
    },
    showNotification(message) {
      this.notificationMessage = tools.getMessageObject(message)
    },
    async downloadURN() {
      try {
        this.downloading = true
        this.downloadTableData = []
        await Promise.all(
          tools
            .getChunkHeadObjects(
              this.headerObject['content-length'],
              this.chunklength * 1000000
            )
            .map(e => {
              const range = e
                ? tools.formatObj(this.customHeaders, e)
                : this.customHeaders
              const downloadEntry = {
                status: 0,
                range: range.Range || 'Full Download',
                size: tools.bytesToSize(e ? e.length : this.contentLength)
              }
              this.downloadTableData.push(downloadEntry)
              return (this.urn.startsWith('urn')
                ? this.ServiceClient.getDerivativesAsync(
                    tools.getURN(this.urn),
                    this.urn,
                    range
                  )
                : this.ServiceClient.getBlobAsync(this.urn, range)
              )
                .then(e => {
                  downloadEntry.data = e.data
                  downloadEntry.status = 1
                })
                .catch(err => {
                  downloadEntry.status = -1
                  downloadEntry.message = err
                })
            })
        )
        if (this.processed == this.saved) {
          this.downloadReady = true
          this.showNotification({
            message:
              'Click to download the concatenated file - you can also download the chunks individually and concatenate them yourself ...',
            actionText: 'Download',
            onAction: () => this.download()
          })
        } else
          this.showNotification(
            'Some chunks failed but you may still download the sucessful ones ...'
          )
      } catch (err) {
        this.showAlertMessage(err)
      } finally {
        this.downloading = false
      }
    },
    download(data, index) {
      if (this.downloading) {
        this.ServiceClient.terminate()
        this.showNotification(
          'Download cancelled - you can still download individual chunks if they are finished ...'
        )
      } else
        window.location = window.URL.createObjectURL(
          new Blob(
            this.downloadTableData.filter(e => e.data).map(e => e.data),
            { type: 'application/stream' }
          )
        )
    },
    handleInputContentLength(value) {
      if (value > 0)
        this.headerObject = Object.assign(this.headerObject, {
          'content-length': value
        })
    }
  },
  computed: {
    downloadDisabled: {
      set: () => {},
      get: function() {
        return !this.downloading && this.saved == 0
      }
    },
    chunklengthValid() {
      return (
        (this.chunklength > 0 && this.chunklength < this.contentLength) ||
        Number(this.chunklength || -1) === 0
      )
    },
    canStartDownload() {
      return !!this.chunklengthValid && !!this.isContentLengthValid
    },
    isContentLengthValid() {
      if (this.contentLength > 0) {
        this.headers = Object.assign({}, this.headers, {
          'content-length': tools.bytesToSize(
            this.headerObject['content-length']
          )
        })
        return true
      }
      return false
    },
    isHeaderSuccess() {
      return Object.keys(this.headers).length
    },
    processed: {
      set: () => {},

      get: function() {
        return this.downloadTableData.filter(e => e.status != 0).length
      }
    },
    toSave: {
      set: () => {},
      get: function() {
        return this.downloadTableData.length
      }
    },
    saved: {
      set: () => {},
      get: function() {
        return this.downloadTableData.filter(e => e.status == 1).length
      }
    }
  },
  data() {
    return {
      customHeaders: defaultHeaders,
      isHeaderLoading: false,
      headers: {},
      headerObject: {},
      token: '',
      urn: '',
      alertMessage: {},
      notificationMessage: {},
      alertDialogMessage: {},
      chunklength: undefined,
      hasError: false,
      canProceed: false,
      downloadReady: false,
      contentLength: undefined,
      showContentLengthInput: false,
      downloading: false,
      downloadTableData: [],
      processNextMessage: '- Click next to proceed'
    }
  }
}
</script>
