<template>
  <animated-container>
    <b-modal :active.sync="bodyTemplateModal"
      ><object-input
        title="Body Variables"
        @update="updateBodyVariables"
        :defaults="bodyVariables"
      ></object-input
    ></b-modal>

    <step-container
      :resetTrigger="resetTrigger"
      :showURN="false"
      :showToken="false"
      @updateParams="customHeaders = $event.obj"
      paramControlName="Headers"
      paramInputTitle="Custom Headers"
      :paramInputs="customHeaders"
      :alertMessage="alertMessage"
      @canProceed="canProceed = $event"
      @stepChange="handleStepChange"
      @reset="reset"
      @urn="urn = $event"
      @token="token = $event"
      :notificationMessage="notificationMessage"
      :alertDialogMessage="alertDialogMessage"
      paramImportPlaceholder='Import Postman v2 request here ... e.g. {header:[...],body:{...},url:"https://..."}'
      paramImportTitle="Import Request Template"
      @updateImport="handleParamImport"
    >
      <b-step-item
        label="Request"
        :type="{
          'is-success': canExecute,
          'is-warning': !canExecute,
          'is-danger': hasError
        }"
      >
        <b-message
          :title="`Request Setup ${canExecute ? processNextMessage : ''}`"
          :closable="false"
          :type="
            `${
              canExecute ? 'is-success' : hasError ? 'is-danger' : 'is-warning'
            }`
          "
        >
          <b-field
            label-position="on-border"
            :type="
              `${
                isURLValid === null
                  ? ''
                  : isURLValid
                  ? 'is-success'
                  : 'is-danger'
              }`
            "
            :label="`${isURLValid === false ? 'Invalid URL！' : 'URL'}`"
          >
            <b-select v-model="method">
              <option v-for="option in methods" :value="option">{{
                option
              }}</option>
            </b-select>
            <b-input
              v-model="url"
              placeholder="Request URL goes here ..."
              @change="checkErrors"
              expanded
            ></b-input>
            <p class="control">
              <b-select
                v-model="doRawPost"
                v-if="method == methods[1]"
                @input="
                  contentType =
                    doRawPost == 'Raw' ? contentTypes[6] : contentType
                "
              >
                <option value="AJAX">AJAX</option>
                <option value="Raw">Raw</option>
              </b-select>
            </p>
          </b-field>
          <b-field
            label="Content Type"
            label-position="on-border"
            :type="
              `${
                isContentTypeValid === null
                  ? ''
                  : isContentTypeValid
                  ? 'is-success'
                  : 'is-danger'
              }`
            "
            :message="
              `${
                isContentTypeValid === false ? 'Invalid content type ...' : ''
              }`
            "
          >
            <b-autocomplete
              placeholder="Content type goes here ..."
              @change="checkErrors"
              :data="contentTypes"
              v-model="contentType"
              expanded
            ></b-autocomplete>
          </b-field>
          <b-field label="Authorization (optional)" label-position="on-border">
            <b-input
              placeholder="Authorization goes here (optional) ..."
              v-model="authorization"
              type="textarea"
              expanded
            ></b-input>
          </b-field>
          <div v-if="showBody">
            <b-field label="Body Template" label-position="on-border">
              <b-select
                @input="templateChanged"
                expanded
                placeholder="Select body template ..."
              >
                <option
                  v-for="template in bodyTemplates"
                  :value="template.id"
                  >{{ template.id }}</option
                >
              </b-select>
            </b-field>
            <b-field
              label="Body"
              label-position="on-border"
              :type="
                `${
                  isBodyValid === null
                    ? ''
                    : isBodyValid
                    ? 'is-success'
                    : 'is-danger'
                }`
              "
              :message="`${isBodyValid === false ? 'Invalid body ...' : ''}`"
            >
              <b-input
                placeholder="Body content goes here ..."
                v-model="body"
                @change="checkErrors"
                type="textarea"
                expanded
              ></b-input>
            </b-field>
            <json-viewer
              boxed
              :value="bodyObject"
              :expand-depth="3"
              v-if="isBodyValid && contentType == contentTypes[0]"
            ></json-viewer>
            <pre v-if="isBodyValid && contentType == contentTypes[6]">{{
              bodyEncoded
            }}</pre>
          </div>
        </b-message>
      </b-step-item>
      <b-step-item
        label="Result"
        :visible="canExecute"
        :clickable="canExecute"
        :type="{
          'is-success': isSuccess,
          'is-warning': !isSuccess,
          'is-danger': !isSuccess && !executing
        }"
      >
        <b-message
          :title="`${executing ? 'Loading request response' : 'Response View'}`"
          :closable="false"
          :type="
            `${
              executing ? 'is-warning' : isSuccess ? 'is-success' : 'is-danger'
            }`
          "
        >
          <loader v-if="executing"></loader>
          <b-select
            placeholder="Select a view type for the response data..."
            v-model="viewType"
            expanded
            v-if="isSuccess"
          >
            <option value="json" selected>JSON</option>
            <option value="text">Editable Text</option>
            <option value="none">Plain</option>
          </b-select>

          <json-viewer
            boxed
            :value="response.headers"
            :expand-depth="3"
            v-if="!executing && isSuccess"
            :copyable="true"
          ></json-viewer>

          <json-viewer
            boxed
            :value="response.data"
            :expand-depth="3"
            v-if="!executing && viewType == 'json' && isSuccess"
            :copyable="true"
          ></json-viewer>
          <b-input
            v-if="!executing && viewType == 'text' && isSuccess"
            :value="
              typeof response.data == 'object'
                ? JSON.stringify(response.data)
                : response.data
            "
            type="textarea"
          ></b-input>
          <pre v-if="!executing && viewType == 'none' && isSuccess" style="word-break:break-all;">{{
            body
          }}</pre>
        </b-message>
      </b-step-item>
      <template slot="help-content">
        <section>
          - See screencast
          <a href="http://tiny.cc/ydxujz" target="_blank">here</a> for step by
          step instructions for the Requester tool ...
        </section>
      </template>
    </step-container>
  </animated-container>
</template>
<script>
import Menu from '../components/Menu'

import AnimatedContainer from '../components/AnimatedContainer'
import ServiceClient from '../plugins/ServiceClient'
import tools from '../plugins/Tools'
import StepContainer from '../components/StepContainer'
import ObjectInput from '../components/ObjectInput'
import 'vue-json-viewer/style.css'
import Loader from '../components/Loader'
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH']
const contentTypes = [
  'application/json',
  'text/plain',
  'application/vnd.api+json',
  'text/xml',
  'application/xml',
  'application/javascript',
  'application/x-www-form-urlencoded'
]
export default {
  head() {
    return { title: process.env.title + '- Request Tool' }
  },
  mounted() {
    this.$store.commit(
      'setTitle',
      'HTTP Request Tool - Forge tokens/jobs or anything else ...'
    )
  },
  components: { Loader, StepContainer, ObjectInput, AnimatedContainer, Menu },
  methods: {
    reset() {
      if (this.ServiceClient) this.ServiceClient.terminate()
      this.ServiceClient = null
      this.doRawPost = 'AJAX'
      this.customHeaders = {}
      this.hasError = false
      this.body = null
      this.contentType = null
      this.url = null
      this.executing = false
      this.isSuccess = false
      this.response = null
      this.alertMessage = {}
      this.notificationMessage = {}
      this.alertDialogMessage = {}
    },
    handleParamImport(event) {
      if (event.header)
        this.customHeaders = event.header.reduce(
          (o, e) => Object.assign(o, { [e.key]: e.value }),
          {}
        )
      this.bodyObject = (event.body && event.body[event.body.mode]) || this.body
      this.url = event.url || this.url
      this.method = event.method || this.method
    },
    templateChanged(val) {
      this.bodyVariables = (this.currentTemplate = this.bodyTemplates.find(
        e => e.id == val
      )).keys
      this.bodyTemplateModal = true
    },
    updateBodyVariables({ obj }) {
      this.url = this.currentTemplate.url || this.url;
      this.method = this.currentTemplate.method || this.method;
      this.doRawPost = this.currentTemplate.doRawPost || this.doRawPost;
      this.contentType = this.currentTemplate.contentType || this.contentType;
      if (this.currentTemplate.id == 'Empty Body')
        this.body =
          this.contentType == contentTypes[0]
            ? obj
            : tools.objectToFormStr(obj, false)
      else
        this.body = Object.entries(obj).reduce(
          (o, e) => o.replace(new RegExp(`\\<${e[0]}\\>`, 'g'), e[1]),
          this.currentTemplate.template
        )
      this.bodyTemplateModal = false
    },
    checkEmpty(val) {
      return val === null
        ? null
        : typeof val == 'string' && val.trim()
        ? true
        : false
    },
    rawPost() {
      new ServiceClient({}).rawPost(
        this.url,
        this.body ? tools.form2Json(this.body) : {}
      )
      setTimeout(() => (this.resetTrigger = Date.now()), 100)
    },
    checkErrors() {
      this.hasError =
        this.isURLValid !== false ||
        this.isContentTypeValid !== false ||
        this.isBodyValid !== false
    },

    handleStepChange(index) {
      if (index == 1 && !this.ServiceClient) {
        this.ServiceClient = new ServiceClient({ axios: this.$axios })
        this.execute()
      }
    },
    showAlertDialogue(message) {
      this.alertDialogMessage = tools.getMessageObject(message.toString())
    },
    showNotification(message) {
      this.notificationMessage = tools.getMessageObject(message)
    },
    showAlertMessage(message) {
      this.alertMessage = tools.getMessageObject(message.toString())
    },
    execute() {
      if (this.doRawPost == 'Raw') this.rawPost()
      else {
        this.executing = true
        this.ServiceClient.execute(
          this.method,
          this.url,
          Object.assign(
            this.authorization ? { Authorization: this.authorization } : {},
            { 'Content-Type': this.contentType },
            this.customHeaders
          ),
          this.body
        )
          .then(response => {
            this.isSuccess = true
            this.response = response
          })
          .catch(err => this.showAlertMessage(err))
          .finally(() => (this.executing = false))
      }
    }
  },
  computed: {
    bodyObject: {
      set: function(val) {
        if (typeof val == 'object') {
          try {
            this.body = JSON.parse(val)
          } catch (err) {
            this.showAlertMessage(err)
          }
        } else this.body = val
      },
      get: function() {
        if (typeof this.body == 'string') {
          try {
            return JSON.parse(this.body)
          } catch (err) {
            this.showAlertMessage(err)
          }
        }
        return typeof this.body == 'object' ? this.body : null
      }
    },
    bodyEncoded() {
      return encodeURI(this.body)
    },
    showBody() {
      return [methods[1], methods[2], methods[6]].includes(this.method)
    },
    canExecute() {
      return (
        this.isURLValid === true &&
        this.isContentTypeValid === true &&
        this.isBodyValid !== false
      )
    },
    isURLValid() {
      let isURLValid
      if ((isURLValid = this.checkEmpty(this.url)) !== null) {
        try {
          new URL(this.url)
          isURLValid = true
        } catch (err) {
          isURLValid = false
        }
      }
      return isURLValid
    },
    isContentTypeValid() {
      return this.method==methods[0]||this.checkEmpty(this.contentType)
    },
    isBodyValid() {
      let isBodyValid = true
      if (this.body && this.showBody) {
        if (this.contentType == contentTypes[0]) {
          try {
            JSON.parse(this.body)
          } catch (err) {
            isBodyValid = false
          }
        }
      } else isBodyValid = null

      return isBodyValid
    }
  },
  data() {
    return {
      hasError: false,
      viewType: 'json',
      methods,
      bodyTemplates: [
        {
          id: 'Empty Body'
        },

        {
          id: 'Forge Token',
          url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
          method: 'POST',
          contentType: 'x-www-form-urlencoded',
          doRawPost: 'Raw',
          template:
            'client_id=<key>&client_secret=<secret>&grant_type=client_credentials&scope=<scope>',
          keys: [
            { name: 'key', required: true, value: '' },
            { name: 'secret', value: '', required: true },
            {
              name: 'scope',
              required: true,
              value: [],
              primitive: true,
              delimiter: ' ',
              values: [
                'data:read',
                'bucket:read',
                'user-profile:read',
                'data:create',
                'data:search',
                'bucket:create',
                'bucket:update',
                'bucket:delete',
                'code:all',
                'user:read',
                'user:write',
                'viewables:read',
                'account:read',
                'account:write'
              ]
            }
          ]
        },
        {
          id: 'Forge Translate',
          url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
          method: 'POST',
          doRawPost: 'AJAX',
          contentType: 'application/json',
          template: `{
    "input": {
        "urn": "<urn>"
    },
    "output": {
        "formats": [{
            "type": "<type>",
            "views": [
           "2d",
           "3d"
         ]
        }]
    }
}`,
          keys: [
            { name: 'urn', required: true, value: '' },
            { name: 'type', value: '', required: true, value: 'svf' }
          ]
        },
        {
          id: 'Forge Translate - Composite',
          url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
          method: 'POST',
          doRawPost: 'AJAX',
          contentType: 'application/json',
          template: `{
    "input": {
        "urn": "<urn>",
        "compressedUrn": true,
        "rootFilename": "<rootFilename>"
    },
    "output": {
        "formats": [{
            "type": "<type>",
            "views": [
           "2d",
           "3d"
         ]
        }]
    }
}`,
          keys: [
            { name: 'urn', required: true, value: '' },
            { name: 'type', value: '', required: true, value: 'svf' },
            { name: 'rootFilename', required: true, value: '' }
          ]
        }
      ],
      bodyVariables: {},
      isSuccess: false,
      doRawPost: 'AJAX',
      currentTemplate: {},

      alertMessage: {},
      notificationMessage: {},
      alertDialogMessage: {},
      result: null,
      response: null,
      body: null,
      authorization: 'Bearer ',
      contentTypes,
      contentType: contentTypes[0],
      url: null,
      executing: false,
      customHeaders: {},
      resetTrigger: null,
      bodyTemplateModal: false,
      processNextMessage: '- Click next to proceed',
      method: methods[0]
    }
  }
}
</script>
