<template>
  <animated-container>
    <step-container
      :alertMessage="alertMessage"
      @updateParams="customHeaders = $event.obj"
      paramControlName="Headers"
      paramInputTitle="Custom Headers"
      :paramInputs="customHeaders"
      @canProceed="canProceed = $event"
      @stepChange="handleStepChange"
      @reset="reset"
      @urn="urn = $event"
      @token="token = $event"
      :notificationMessage="notificationMessage"
      :alertDialogMessage="alertDialogMessage"
      urnTitleText="Object URN or Full URL"
      urnLabelText="URN/URL"
      paramImportPlaceholder='Import Postman v2 request here ... e.g. {header:[...],body:{...},url:"https://..."}'
      paramImportTitle="Import Request Template"
      @updateImport="handleParamImport"
    >
      <b-step-item
        label="Chunk Length"
        :visible="canProceed"
        :clickable="canProceed"
        :type="{
          'is-success': canStartUpload,
          'is-warning': !canStartUpload,
          'is-danger': !canStartUpload
        }"
      >
        <b-message
          :title="`Chunk Length ${canStartUpload ? processNextMessage : ''}`"
          :closable="false"
          :type="`${canStartUpload ? 'is-success' : 'is-warning'}`"
        >
          <b-field
            :type="`${isContentLengthValid ? 'is-success' : 'is-danger'}`"
            :message="
              `${
                isContentLengthValid
                  ? `Size of file to upload: ${tools.bytesToSize(
                      uploadFile.size
                    )}`
                  : 'Pick file to upload ...'
              }`
            "
          >
            <b-input
              @input.native="handleFileInput"
              type="file"
              name="uploadFile"
              expanded
            ></b-input
          ></b-field>
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
              expanded
            ></b-input>
          </b-field>
        </b-message>
      </b-step-item>
      <b-step-item
        label="Upload"
        :visible="canStartUpload"
        :clickable="canStartUpload"
        :type="{
          'is-success': uploadComplete,
          'is-warning': !uploadComplete,
          'is-danger': hasError
        }"
      >
        <b-message
          :title="
            ` ${
              uploading
                ? 'Uploading'
                : hasError
                ? 'Error occurred ...'
                : 'Upload Completed!'
            }`
          "
          :closable="false"
          :type="
            `${
              uploading ? 'is-warning' : hasError ? 'is-danger' : 'is-success'
            }`
          "
        >
          <loader v-if="uploading"></loader>
          <b-progress
            class="progress"
            :value="(uploaded / toUpload) * 100"
            show-value
            :type="
              `${
                uploadComplete
                  ? 'is-success'
                  : hasError
                  ? 'is-danger'
                  : 'is-info'
              }`
            "
          >
            {{ processed != toUpload ? 'Uploading - ' : '' }} Completed:
            {{ uploaded }} out of {{ toUpload }}
          </b-progress>
        </b-message>
        <b-table class="data-table" :data="uploadTableData">
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
                      : 'Click to download'
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
                <b-button
                  v-if="props.row.status == 1"
                  @click="download(props.row.data, props.index)"
                  type="is-text"
                  ><b-icon icon="download" type="is-success"></b-icon
                ></b-button>
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
          <a href="http://tiny.cc/jbxujz" target="_blank">here</a> for step by
          step instructions for the Uploader tool ...
        </section>
      </template>
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
import StepContainer from '../components/StepContainer'
import tools from '../components/Tools'
import Loader from '../components/Loader'
const defaultHeaders = {
  'session-id': ':sessionId',
  'Content-Length': ':length',
  'Content-Range': 'bytes :start-:end/:contentLength'
}
export default {
  head() {
    return { title: process.env.title + '- Upload Tool' }
  },
  mounted() {
    this.$store.commit('setTitle', 'Upload Tool (for Forge objects and beyond)')
  },
  components: { StepContainer, Loader, AnimatedContainer },
  methods: {
    reset() {
      if (this.ServiceClient) this.ServiceClient.terminate()
      this.uploadFile = {}
      this.uploadComplete = false
      this.uploading = false
      this.uploadTableData = []
      this.chunklength = undefined
      this.customHeaders = defaultHeaders
    },
    handleParamImport(event) {
      if (event.header)
        this.customHeaders = event.header.reduce(
          (o, e) => Object.assign(o, { [e.key]: e.value }),
          {}
        )
    },
    handleStepChange(index) {
      if (index == 3 && !this.uploading && !this.uploadComplete) {
        this.ServiceClient =
          this.ServiceClient ||
          new ServiceClient({ axios: this.$axios, token: this.token })

        this.upload()
      }
    },
    showAlertMessage(message) {
      this.alertMessage = tools.getMessageObject(message.toString())
    },

    handleFileInput(event) {
      this.uploadFile = event.target.files[0]
    },
    showAlertDialogue(message) {
      this.alertDialogMessage = tools.getMessageObject(message.toString())
    },
    showNotification(message) {
      this.notificationMessage = tools.getMessageObject(message)
    },
    async upload() {
      try {
        this.uploading = true
        this.uploadTableData = []
        const sessionId = tools.getRandomString()

        //TODO: Switch parallel/sequential requests

        await Promise.all(
          tools
            .getChunkHeadObjects(this.contentLength, this.chunklength * 1000000)
            .map(e => {
              const range = e
                ? tools.formatObj(
                    this.customHeaders,
                    Object.assign(e, {
                      contentLength: this.contentLength,
                      sessionId
                    })
                  )
                : this.customHeaders
              console.log(range)
              const uploadEntry = {
                status: 0,
                range: range['Content-Range'] || 'Full Download',
                size: tools.bytesToSize(e ? e.length : this.contentLength)
              }
              this.uploadTableData.push(uploadEntry)
              return this.ServiceClient[
                this.urn.startsWith('http') ? 'putAsync' : 'putObjectAsync'
              ](
                this.urn,
                e ? this.uploadFile.slice(e.start, e.end) : this.uploadFile,
                range
              )
                .then(() => (uploadEntry.status = 1))
                .catch(err => {
                  uploadEntry.status = -1
                  uploadEntry.message = err
                })
            })
        )

        if (this.processed == this.uploaded) {
          this.uploadComplete = true
          this.showNotification('Upload complete!')
        } else
          this.showAlertMessage(
            'Some chunks failed to upload - see error message of failed items individually ...'
          )
      } catch (err) {
        this.showAlertMessage(err)
      } finally {
        this.uploading = false
      }
    },

    handleChunkInput(value) {}
  },
  computed: {
    hasError() {
      return this.toUpload == this.processed && this.toUpload != this.uploaded
    },
    chunklengthValid() {
      return (
        (this.chunklength > 0 && this.chunklength < this.uploadFile.size) ||
        Number(this.chunklength || -1) === 0
      )
    },
    canStartUpload() {
      return !!this.chunklength && this.contentLength > 0
    },
    isContentLengthValid() {
      return this.contentLength > 0
    },
    contentLength() {
      return this.uploadFile.size
    },
    processed() {
      return this.uploadTableData.filter(e => e.status != 0).length
    },
    toUpload() {
      return this.uploadTableData.length
    },
    uploaded() {
      return this.uploadTableData.filter(e => e.status == 1).length
    }
  },
  data() {
    return {
      customHeaders: defaultHeaders,
      token: '',
      urn: '',
      tools,
      uploadFile: {},
      uploading: false,
      alertMessage: {},
      notificationMessage: {},
      alertDialogMessage: {},
      chunklength: undefined,
      uploadComplete: false,
      canProceed: false,
      uploadTableData: [],
      processNextMessage: '- Click next to proceed'
    }
  }
}
</script>
