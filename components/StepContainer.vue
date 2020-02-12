<template>
  <section>
    <b-modal :active.sync="paramInputModal"
      ><object-input
        :allowType="allowParamInputType"
        :title="paramInputTitle"
        @update="updateParams"
        :defaults="paramInputs"
      ></object-input
    ></b-modal>
    <b-modal :active.sync="paramImportModal">
      <input-importer
        @update="updateImports"
        :placeholder="paramImportPlaceholder"
        :title="paramImportTitle"
      ></input-importer>
    </b-modal>
    <b-modal :active.sync="showHelp">
      <b-message title="Help" type="is-info" :closable="false">
        <section>
          - For more information on the Autodesk Forge platform see
          <a href="https://forge.autodesk.com/" target="_blank">here</a> and
          <a href="https://learnforge.autodesk.io/" target="_blank">here</a> ...
        </section>
        <section>
          - For security reasons it's recommended to obtain an Forge access
          token by yourself following
          <a
            href="https://forge.autodesk.com/en/docs/oauth/v2/tutorials/get-2-legged-token/"
            target="_blank"
            >here</a
          >
          ...
        </section>
        <slot name="help-content"> </slot>
        <section>
          - See this blog
          <a href="http://tiny.cc/zyvujz" target="_blank">here</a> for a
          comprehensive rundown of the tools available here ...
        </section>
        <section>
          - Visit this Github repo
          <a href="https://github.com/dukedhx/forge-tools-hub" target="_blank"
            >here</a
          >
          to submit questions, comments, PRs, issue/bug reports ...
        </section>
      </b-message>
    </b-modal>
    <b-notification
      type="is-danger"
      aria-close-label="Close notification"
      :active.sync="showAlert"
      role="alert"
    >
      {{ alertMessage && alertMessage.message }}
    </b-notification>
    <b-steps
      v-model="activeStep"
      :animated="true"
      :has-navigation="true"
      @change="$emit('stepChange', $event)"
    >
      <b-step-item
        :label="tokenLabel"
        clickable
        v-if="showToken"
        :type="{
          'is-success': URNClickable,
          'is-warning': !URNClickable,
          'is-danger': !URNClickable && showAlert
        }"
      >
        <b-message
          :title="`${tokenTitle} ${URNClickable ? processNextMessage : ''}`"
          :closable="false"
          :type="`${URNClickable ? 'is-success' : 'is-warning'}`"
        >
          <b-field>
            <b-input
              :disabled="tokenDisabled"
              :loading="tokenLoading"
              placeholder="Put access token here and click next ..."
              v-model="token"
              @input="$emit('token', $event)"
              type="textarea"
            ></b-input>
          </b-field>
        </b-message>
      </b-step-item>

      <b-step-item
        :label="urnLabel"
        :visible="URNClickable"
        v-if="showURN"
        :clickable="URNClickable"
        :type="{
          'is-success': URNClickable,
          'is-warning': !URNClickable,
          'is-danger': !URNClickable && showAlert
        }"
      >
        <b-message
          :title="`${urnTitle} ${canProceed ? processNextMessage : ''}`"
          :closable="false"
          :type="`${canProceed ? 'is-success' : 'is-warning'}`"
        >
          <b-field>
            <b-input
              :disabled="urnDisabled"
              placeholder="Then model URN here and click next ..."
              v-model="urn"
              @input="$emit('urn', $event)"
              :loading="urnLoading"
              expanded
            ></b-input>
            <p class="control" v-if="loadButtonTitle">
              <button
                class="button"
                :disabled="!canProceed"
                @click="$emit('loadButtonPressed')"
              >
                {{ loadButtonTitle }}
              </button>
            </p>
          </b-field>
          <b-field v-if="showGuid">
            <b-input
              :disabled="guidDisabled"
              placeholder="GUID here and click next ..."
              v-model="guid"
              @input="$emit('guid', $event)"
              :loading="guidLoading"
            ></b-input>
          </b-field>
        </b-message>
      </b-step-item>
      <slot></slot>
      <template slot="navigation" slot-scope="{ previous, next }">
        <nav class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <b-button
                outlined
                icon-left="chevron-left"
                :disabled="previous.disabled"
                @click.prevent="previous.action"
              >
              </b-button>
            </div>
            <div class="level-item">
              <b-button
                outlined
                icon-right="chevron-right"
                :disabled="next.disabled"
                @click.prevent="next.action"
              >
              </b-button>
            </div>
          </div>
          <div class="level-right">
            <slot name="custom-controls"></slot>
            <div class="level-item" v-if="!!paramInputs">
              <b-button outlined @click="paramInputModal = true">
                {{ paramControlName }}
              </b-button>
            </div>
            <div class="level-item" v-if="!!paramImportTitle">
              <b-button outlined @click="paramImportModal = true">
                {{ paramImportControlTitle || paramImportTitle.split(' ')[0] }}
              </b-button>
            </div>
            <div class="level-item">
              <b-button outlined @click.prevent="showHelp = true">
                Help
              </b-button>
            </div>
            <div class="level-item">
              <b-button outlined @click.prevent="reset">
                Reset
              </b-button>
            </div>
          </div>
        </nav>
      </template>
    </b-steps>
  </section>
</template>
<style scoped>
.b-steps ::v-deep .step-title {
  color: #fff;
}
</style>

<script>
import ObjectInput from './ObjectInput'
import InputImporter from './InputImporter'

export default {
  components: { ObjectInput, InputImporter },
  methods: {
    updateParams(headers) {
      this.paramInputModal = false
      this.$emit('updateParams', headers)
    },
    reset() {
      this.activeStep = 0
      this.token = ''
      this.showHelp = false
      this.urn = ''
      this.currentAlertMessage = null
      this.showAlert = false
      this.paramInputModal = false
      this.$emit('reset')
    },
    updateImports(event) {
      this.paramImportModal = false
      this.$emit('updateImport', event)
    },
    getTimeStamp(message) {
      return message && message.timestamp
    }
  },
  watch: {
    step: function(val) {
      if (val > -1) this.activeStep = val
    },
    alertMessage: function(val) {
      this.showAlert = !!(val && val.message)
    },
    confirmDialogue: val => {
      if (val && (val.message || val.title))
        this.$buefy.dialog.confirm({
          title: this.confirmDialogueMessage.title,
          message: this.confirmDialogueMessage.message,

          cancelText: this.confirmDialogueMessage.cancel || 'Cancel',
          confirmText: this.confirmDialogueMessage.ok || 'OK',
          type: this.confirmDialogueMessage.type || 'is-success',
          onConfirm: this.confirmDialogueMessage.onAction
        })
    },
    notificationMessage: function(val) {
      if (val && val.message)
        this.$buefy.snackbar.open({
          queue: !!this.notificationMessage.queue,
          message: this.notificationMessage.message,
          type: this.notificationMessage.type || 'is-warning',
          position: this.notificationMessage.position || 'is-top',
          actionText: this.notificationMessage.actionText,
          indefinite: !!this.notificationMessage.indefinite,
          onAction: this.notificationMessage.onAction
        })
    },
    alertDialogMessage: function(val) {
      if (val && val.message)
        this.$buefy.dialog.alert({
          title: this.alertDialogMessage.type || 'Error',
          message: this.alertDialogMessage.message,
          type: this.alertDialogMessage.type || 'is-danger',
          hasIcon: true,
          icon: 'close-circle',
          ariaRole: 'alertdialog',
          ariaModal: true
        })
    },
    resetTrigger: function(val) {
      if (val) this.reset()
    }
  },
  computed: {
    tokenLabel() {
      return this.tokenLabelText || 'Token'
    },
    tokenTitle() {
      return this.tokenTitleText || 'Access Token'
    },
    urnLabel() {
      return this.urnLabelText || 'URN'
    },
    urnTitle() {
      return this.urnTitleText || 'Model URN'
    },
    URNClickable() {
      return !!this.token
    },

    canProceed() {
      const proceed = !!this.token && !!this.urn
      this.$emit('canProceed', proceed)
      return proceed
    }
  },
  props: {
    step: {
      type: Number,
      default: -1
    },
    allowParamInputType: {
      default: false,
      type: Boolean
    },
    paramInputs: {
      type: Object | Array
    },
    paramControlName: {
      type: String
    },
    loadButtonTitle: {
      type: String
    },
    paramImportTitle: {
      type: String
    },
    paramImportPlaceholder: {
      type: String
    },
    paramImportControlTitle: {
      type: String
    },
    paramInputTitle: {
      type: String
    },
    urnLoading: {
      type: Boolean,
      default: false
    },
    showURN: {
      type: Boolean,
      default: true
    },
    showToken: {
      type: Boolean,
      default: true
    },
    tokenLoading: {
      type: Boolean,
      default: false
    },
    tokenDisabled: {
      type: Boolean,
      default: false
    },
    urnDisabled: {
      type: Boolean,
      default: false
    },
    guidDisabled: {
      type: Boolean,
      default: false
    },
    guidLoading: {
      type: Boolean,
      default: false
    },
    showGuid: {
      type: Boolean,
      default: false
    },
    tokenLabelText: {
      type: String
    },
    tokenTitleText: {
      type: String
    },
    urnLabelText: {
      type: String
    },
    urnTitleText: {
      type: String
    },
    alertMessage: {
      type: Object
    },
    alertDialogMessage: {
      type: Object
    },
    confirmDialogueMessage: {
      type: Object
    },
    notificationMessage: {
      type: Object
    },
    resetTrigger: {
      type: Number
    }
  },

  data() {
    return {
      showHelp: false,
      paramImportModal: false,
      paramInputModal: false,
      showHelp: false,
      lastReset: null,
      messageTimestamps: {},
      guid: '',
      urn: '',
      token: '',
      showAlert: false,
      activeStep: 0,
      processNextMessage: '- Click next to proceed'
    }
  }
}
</script>
