<template>
  <animated-container :customStyle="{ background: 'rgba(255, 255, 255, 0.9)' }">
    <b-tabs expanded>
      <b-tab-item label="Tutorial">
        <b-field label="Course">
          <b-select
            :placeholder="isLoadingTutorial ? 'Loading ...' : 'Choose tutorial'"
            :loading="isLoadingTutorial"
            @input="startTutorial"
            expanded
          >
            <option v-for="tutorial of tutorialData">{{
              tutorial.fields.title
            }}</option>
          </b-select>
        </b-field>
        <b-field
          label="Access Token"
          :type="tokenValid ? 'is-success' : 'is-danger'"
          :message="
            !token || tokenValid ? '' : 'Access token is invalid or expired ...'
          "
        >
          <b-input
            :loading="isLoadingTutorial"
            :disabled="isLoadingTutorial"
            type="textarea"
            v-model="token"
            placeholder="Access token goes here ..."
          ></b-input>
        </b-field>
        <b-field
          label="Playground"
          :message="
            tokenValid
              ? ''
              : 'Put in a valid access token to begin - see tutorials for instructions...'
          "
          :type="tokenValid ? 'is-success' : 'is-danger'"
        >
          <section
            class="swaggerContainer"
            ref="container"
            v-show="tokenValid"
          ></section>
        </b-field>
      </b-tab-item>
      <b-tab-item label="Resource Finder">
        <b-loading
          :active="isLoadingTopics"
          :is-full-page="false"
          :can-cancel="false"
        ></b-loading>
        <b-collapse
          class="card noBackground"
          v-for="(filter, index) of filters"
          :key="index"
          :open="!!!filter.answer"
        >
          <div
            slot="trigger"
            slot-scope="props"
            class="card-header"
            role="button"
          >
            <p class="card-header-title">
              {{ index + 1 }}.{{ filter.question }}
              {{ filter.answer ? `- ${filter.answer.fields.title}` : '' }}
            </p>
            <a class="card-header-icon">
              <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"> </b-icon>
            </a>
          </div>
          <div class="card-content">
            <div class="content">
              <b-select
                placeholder="Select an answer"
                @input="filterAnswerChange(index)"
                v-model="filter.answer"
                expanded
              >
                <option v-for="answer of filter.answers" :value="answer">{{
                  answer.fields.title
                }}</option>
              </b-select>
            </div>
          </div>
        </b-collapse>
        <b-table :data="filteredLinks" class="noBackground" hoverable>
          <template slot-scope="props">
            <b-table-column label="Resource">
              <a :href="props.row.url" target="_blank">{{
                props.row.fields.title || props.row.fields.url
              }}</a>
            </b-table-column>
            <b-table-column label="Type">
              {{ props.row.fields.type }}
            </b-table-column>
            <b-table-column label="Tags">
              <b-dropdown hoverable>
                <b-button type="is-text" slot="trigger" slot-scope="{ active }">
                  <span>Show Tags</span>
                  <b-icon :icon="active ? 'menu-up' : 'menu-down'"></b-icon>
                </b-button>

                <b-dropdown-item
                  :key="index"
                  v-for="(tag, index) of props.row.fields.tags.map(
                    e => e.fields.title
                  )"
                  >{{ tag }}</b-dropdown-item
                >
              </b-dropdown>
            </b-table-column>
          </template>
        </b-table>
      </b-tab-item>

      <b-tab-item label="Viewer Playground">
        <b-field
          label="Access Token"
          :type="tokenValid ? 'is-success' : 'is-danger'"
          :message="
            !token || tokenValid ? '' : 'Access token is invalid or expired ...'
          "
        >
          <b-switch v-model="useSameToken" disabled>Same as Tutorial</b-switch>
          <b-input
            type="textarea"
            v-model="token"
            placeholder="Access token goes here ..."
            v-if="false"
          ></b-input>
        </b-field>

        <b-field
          :label="
            !urn || urnValid ? 'Model URN/URL' : 'Invalid Model URL/URN ...'
          "
          label-position="on-border"
          :type="urnValid ? 'is-success' : 'is-danger'"
        >
          <b-input
            v-model="urn"
            placeholder="URL/URN goes here ..."
            expanded
          ></b-input>
          <p class="control">
            <b-button @click="launchViewer" :disabled="!urnValid"
              >Launch</b-button
            >
          </p>
        </b-field>
        <b-field
          label="View Guid (optional)"
          label-position="on-border"
          type="is-success"
        >
          <b-input
            v-model="guid"
            placeholder="View Guid goes here (optional) ..."
            expanded
          ></b-input>
        </b-field>
        <b-collapse class="card noBackground" :open="viewerOptionsModal">
          <div
            slot="trigger"
            slot-scope="props"
            class="card-header"
            role="button"
          >
            <p class="card-header-title">
              Viewer Options
            </p>
            <a class="card-header-icon">
              <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"> </b-icon>
            </a>
          </div>
          <div class="card-content">
            <div class="content">
              <object-input
                title="Viewer Options"
                @update="updateViewerOptions"
                :defaults="viewerOptions"
              ></object-input>
            </div>
          </div>
        </b-collapse>
        <pre v-if="urnValid">
             // Code to initialize Viewer would be as follows:
             const initOptions = {
                env: {{
            this.urn.startsWith('http') ? 'Local' : 'AutodeskProduction'
          }},
                {{
            this.urn.startsWith('http') ? '' : `accessToken:"${this.token}"`
          }}
             }
             const options = {{ this.viewerOptionsObj }}
             Autodesk.Viewing.Initializer(initOptions, ()={
             const viewer = new Autodesk.Viewing.GuiViewer3D(container, options);
             viewer.start();
             {{
            this.urn.startsWith('http')
              ? `this.viewer.loadModel(
            "${this.urn}",
            options)`
              : `Autodesk.Viewing.Document.load('urn:${this.urn}', doc =>{
               viewer.loadDocumentNode(
                doc,
                doc.getRoot().search({ guid:${this.guid} })[0] ||
                  doc.getRoot().getDefaultGeometry(),
                options
               );
               doc.downloadAecModelData()
             })`
          }}
           })
           </pre
        >
      </b-tab-item>
    </b-tabs>
    <b-navbar fixed-bottom class="windowBar" v-if="showWindBar">
      <template slot="start">
        <b-navbar-item
          href="#"
          v-for="(wind, index) of tutorials"
          :key="'viewer' + index"
          v-if="!wind.isOpen"
          @click="wind.isOpen = true"
        >
          <b-button outlined>
            {{ wind.title
            }}<a @click="closeWindow(index, tutorials)" class="closeIcon"
              ><b-icon size="is-small" icon="close-circle"></b-icon
            ></a>
          </b-button>
        </b-navbar-item>
        <b-navbar-item
          href="#"
          v-for="(wind, index) of viewers"
          :key="index"
          v-if="!wind.isOpen"
          @click="wind.isOpen = true"
        >
          <b-button outlined>
            {{ wind.title
            }}<a @click="closeWindow(index, viewers)" class="closeIcon"
              ><b-icon size="is-small" icon="close-circle"></b-icon
            ></a>
          </b-button>
        </b-navbar-item>
      </template>
    </b-navbar>

    <hsc-window-style-metal class="windows">
      <hsc-window
        v-for="(viewer, index) of viewers"
        :key="'tut' + index"
        :title="viewer.title"
        resizable
        isScrollable
        :minWidth="500"
        :minHeight="500"
        closeButton
        :isOpen.sync="viewer.isOpen"
        class="fixed"
        @resize-end="resizeViewer = Date.now()"
      >
        <Viewer
          active
          :urn="viewer.urn"
          :token="viewer.token"
          :options="viewer.options"
          :guid="viewer.guid"
          :resizeChecker="resizeViewer"
          loader
        ></Viewer>
      </hsc-window>
      <hsc-window
        v-for="(tutorial, index) of tutorials"
        :key="index"
        :title="tutorial.title"
        resizable
        isScrollable
        :minWidth="500"
        :minHeight="500"
        closeButton
        :isOpen.sync="tutorial.isOpen"
        class="fixed"
      >
        <b-message
          v-for="(step, index) in tutorial.steps"
          :key="index"
          :title="step.title"
          :closable="false"
          class="tutorialStep"
          :type="step.done ? 'is-success' : 'is-info'"
        >
          <a class="card-header-icon" @click="toggleStep(step)">
            <b-icon :icon="step.open ? 'menu-down' : 'menu-up'"> </b-icon>
          </a>
          <b-collapse class="card" :key="sb" :open="!!step.open">
            <div class="card-content">
              <div
                class="content"
                v-html="documentToHtmlString(step.content)"
              ></div>
            </div>
            <footer class="card-footer">
              <b-button
                class="card-footer-item"
                :href="step.helpLink"
                target="_blank"
                >Help</b-button
              >
              <b-button
                class="card-footer-item"
                @click="jumpToSwaggerUISection(step)"
                >Try It Out</b-button
              >
              <b-button
                class="card-footer-item"
                @click="done(tutorial.steps, index)"
                >Done</b-button
              >
            </footer>
          </b-collapse>
        </b-message>
        <b-message
          v-if="tutorial.quiz"
          title="Quiz"
          :closable="false"
          class="tutorialStep"
          type="is-info"
        >
          <a class="card-header-icon" @click="toggleStep(tutorial)">
            <b-icon :icon="tutorial.openquiz ? 'menu-up' : 'menu-down'">
            </b-icon>
          </a>
          <b-collapse :key="sb" :open="tutorial.openquiz">
            <quiz :questions="tutorial.quiz"></quiz>
          </b-collapse>
        </b-message>
      </hsc-window>
    </hsc-window-style-metal>
  </animated-container>
</template>
<style lang="scss" scoped>
.fixed {
  position: fixed !important;
}
.windowBar {
  background: rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  max-width: 100%;
  &::v-deep a.navbar-item {
    position: relative;
    max-width: 200px;
    .button {
      padding-right: 20px;
    }
    .button,
    span {
      text-overflow: ellipsis;
      overflow: hidden;
    }
    &:hover {
      background: #ffdd57;
    }
    .closeIcon {
      position: absolute;
      right: 5px;
      top: 2px;
    }
  }
}
.tutorialStep {
  position: relative;
  &::v-deep .card-header-icon {
    position: absolute;
    color: #fff !important;
    top: 0;
    right: 5px;
  }
}
.windows ::v-deep .window {
  .viewerContainer {
    height: 100%;
  }
  .button {
    z-index: 233 !important;
  }

  z-index: 233 !important;
  background: #fff !important;
  .title {
    font-size: 20px;
  }
}
.noBackground {
  &,
  &::v-deep .table {
    background: none;
  }
}
.swaggerContainer {
  &::v-deep .information-container,
  &::v-deep .scheme-container {
    display: none;
  }
  &::v-deep .scheme-container {
    background: none;
  }
}
</style>
<script>
import AnimatedContainer from '../components/AnimatedContainer'
import Quiz from '../components/Quiz'
import Viewer from '../components/Viewer'
import ObjectInput from '../components/ObjectInput'
import tools from '../plugins/Tools'
import ServiceClient from '../plugins/ServiceClient'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import contentful from '~/plugins/contentful.js'
const client = contentful.createClient()

export default {
  components: { AnimatedContainer, Quiz, Viewer, ObjectInput },
  methods: {
    updateViewerOptions(event) {
      this.viewerOptions = event.array
      this.viewerOptionsObj = event.obj
    },
    closeWindow(index, array) {
      array.splice(index, 1)
    },
    launchViewer() {
      this.viewers.push({
        guid: this.guid,
        token: this.token,
        title: this.urn,
        urn: this.urn,
        isOpen: true,
        options: Object.assign({}, this.viewerOptionsObj)
      })
    },
    startTutorial(val) {
      const wind = this.tutorials.find(e => e.title == val)
      if (wind) wind.isOpen = true
      else {
        let tutorial = this.tutorialData.find(e => e.fields.title == val)
        tutorial = {
          isOpen: true,
          openquiz: true,
          steps: tutorial.fields.steps.map(e => e.fields),
          quiz: tutorial.fields.quiz.map(e => Object.assign({}, e.fields)),
          title: tutorial.fields.title
        }
        tutorial.steps[0].open = true
        this.tutorials.push(tutorial)
      }
    },
    updateSteps() {
      this.sb = tools.getRandomString()
    },
    toggleStep(step) {
      step.open = !step.open
      this.updateSteps()
    },
    jumpToSwaggerUISection(step) {
      if (step.linkId) window.location.hash = '#' + step.linkId
    },
    done(steps, index) {
      if (index + 1 < steps.length) {
        this.jumpToSwaggerUISection(steps[index + 1])
        steps[index + 1].open = true
      }
      steps[index].open = false
      steps[index].done = true
      this.updateSteps()
    },
    filterAnswerChange(index) {
      this.filters = this.filters.slice(0, index + 1)
      const tags = this.filters.map(e => e.answer.sys.id),
        topic = this.filters[0].answer.fields.title
      this.filteredLinks = this.resources.data.filter(
        e =>
          e.fields.topic.some(e => e.fields.title == topic) &&
          e.fields.tags.some(e => tags.includes(e.sys.id))
      )
      const nextquiz = this.resources.questions
        .filter(
          e => !this.filters.map(e => e.type).includes(e.fields.type.sys.id)
        )
        .sort((a, b) => {
          let an = 0,
            bn = 0
          this.filteredLinks
            .map(e => e.fields.tags)
            .forEach(e => {
              ;(an = e.reduce(
                (o, v) =>
                  (o += this.resources.tags.filter(
                    e =>
                      e.fields.title == v.fields.title &&
                      e.fields.type.sys.id == a.fields.type.sys.id
                  ).length),
                0
              )),
                (bn = e.reduce(
                  (o, v) =>
                    (o += this.resources.tags.filter(
                      e =>
                        e.fields.title == v &&
                        e.fields.type.sys.id == b.fields.type.sys.id
                    ).length),
                  0
                ))
            })
          return bn - an
        })[0]
      if (nextquiz)
        this.filters.push({
          type: nextquiz.fields.type.sys.id,
          question: nextquiz.fields.title,
          answers: this.resources.tags.filter(
            e => e.fields.type.sys.id == nextquiz.fields.type.sys.id
          )
        })
    },
    showNotification(message, type, position) {
      this.$buefy.snackbar.open({
        message: message,
        type: type || 'is-warning',
        position: position || 'is-top'
      })
    },
    loadSwagger() {
      Promise.all([
        this.$loadScript(process.env.swaggerUIURL),
        this.$loadStyle(process.env.swaggerCSSURL)
      ]).then(() => {
        this.swaggerUi = window.SwaggerUIBundle({
          requestInterceptor(req) {
            req.headers.authorization = 'Bearer ' + window.sb233token
            return req
          },
          spec: this.spec,
          domNode: this.$refs.container,
          deepLinking: true
        })
      })
    }
  },
  async asyncData({ error }) {
    try {
      const [tutorialdata, resources, openapis] = await Promise.all([
        client.getEntries({ content_type: 'tutorialdata' }),
        client.getEntries({ content_type: 'resources' }),
        client.getEntries({ content_type: 'openapi' })
      ])
      const topics = resources.items[0].fields
      const spec = openapis.items[0].fields.payload
      return {
        tutorialData: tutorialdata.items,

        resources: topics,
        spec,
        filters: [
          {
            question: topics.question || 'Test Test 233?',
            answers: topics.topics
          }
        ]
      }
    } catch (err) {
      error({ statusCode: 500, message: err.message })
    }
  },
  computed: {
    isLoadingTutorial() {
      return !(typeof this.tutorialData == 'object')
    },
    isLoadingTopics() {
      return !(typeof this.resources == 'object')
    },
    showWindBar() {
      return [...this.tutorials, ...this.viewers].some(e => !e.isOpen)
    },
    urnValid() {
      if (this.urn) {
        try {
          if (this.urn.startsWith('http')) new URL(this.urn)
          else {
            if (!this.tokenValid) return false
            if (!this.urn.startsWith('urn:adsk.objects:os.object:'))
              atob(this.urn)
          }
          return true
        } catch (err) {
          console.log(err)
        }
      }
      return false
    },
    tokenValid() {
      if (this.token && this.token.split('.').length == 3) {
        try {
          const payload = JSON.parse(atob(this.token.split('.')[1]))
          const result = !!(
            payload.client_id &&
            payload.scope &&
            payload.aud &&
            payload.jti &&
            payload.exp * 1000 > Date.now()
          )
          if(result) window.sb233token = this.token
          return result
        } catch (err) {
          console.log(err)
        }
      }
      return false
    }
  },
  head() {
    return { title: process.env.title + '- Tutorial/Playground' }
  },
  data() {
    return {
      resizeViewer: null,
      viewerOptionsModal: false,
      viewerOptions: [
        {
          name: 'extensions',
          value: [
            'Autodesk.DocumentBrowser',
            'Autodesk.AEC.Minimap3DExtension'
          ],
          type: 'object'
        }
      ],
      viewerOptionsObj: {
        extensions: [
          'Autodesk.DocumentBrowser',
          'Autodesk.AEC.Minimap3DExtension'
        ]
      },
      useSameToken: true,
      urn: '',
      guid: '',
      tutorials: [],
      viewers: [],
      sb: tools.getRandomString(),
      token: '',
      isOpen: true,
      filteredLinks: [],
      swaggerUi: null
    }
  },
  mounted() {
    this.documentToHtmlString = documentToHtmlString
    this.ServiceClient = new ServiceClient({ axios: this.$axios })

    this.loadSwagger()

    this.$store.commit('setTitle', 'Tutorial & Playground')
  }
}
</script>
