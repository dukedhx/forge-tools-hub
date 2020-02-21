<template>
  <b-message :closable="false" :title="title" class="quiz-item">
    <b-progress
      :value="progress"
      show-value
      :type="
        progress > 30
          ? progress < 50
            ? 'is-primary'
            : progress > 80
            ? 'is-success'
            : 'is-info'
          : 'is-danger'
      "
    >
      {{ graded ? 'Correct' : 'Completed' }}: {{ answered }} out of
      {{ questions.length }}
    </b-progress>
    <b-steps v-model="activeStep" class="steps">
      <b-step-item
        :type="
          graded
            ? question.answer == question.expected
              ? 'is-success'
              : 'is-danger'
            : ''
        "
        :label="String(index + 1)"
        v-for="(question, index) in questions"
        :key="index"
        :visible="activeStep > index - 3 && activeStep < index + 3"
        clickable
      >
        <div class="card">
          <div class="card-header">
            <p class="card-header-title">
              {{ question.title }}
            </p>
          </div>
          <div class="card-content">
            <div class="content">
              <b-field :key="i" v-for="(answer, i) of question.answers">
                <b-radio
                  v-model="question.answer"
                  :native-value="i"
                  :disabled="graded"
                  :type="
                    graded
                      ? i == question.expected
                        ? 'is-success'
                        : i == question.answer
                        ? 'is-danger'
                        : ''
                      : ''
                  "
                >
                  {{ answer }}
                </b-radio>
                <p
                  class="control"
                  v-if="
                    graded && (i == question.answer || i == question.expected)
                  "
                >
                  <b-icon
                    :icon="
                      i == question.expected ? 'check-circle' : 'close-circle'
                    "
                    :type="i == question.expected ? 'is-success' : 'is-danger'"
                  ></b-icon>
                </p>
              </b-field>
            </div>
          </div>
        </div>
      </b-step-item>
      <b-step-item
        class="has-text-centered"
        label="Grade"
        :visible="questions.length - activeStep < 5"
        clickable
      >
        <b-button @click="grade">Grade</b-button>
        <b-button @click="reset">Reset</b-button>
      </b-step-item>
    </b-steps>
  </b-message>
</template>
<style lang="scss" scoped>
.steps {
  &::v-deep .step-items {
    list-style: none;
  }
}
.quiz-item ::v-deep .media-content {
  overflow: hidden;
}
</style>
<script>
export default {
  methods: {
    grade(){
      this.grade=true
      this.activeStep=0
    },
    reset() {
      this.activeStep = 0
      this.graded = false
      this.questions.forEach(e => delete e.answer)
    }
  },
  computed: {
    answered() {
      return this.questions.filter(q =>
        this.graded ? q.answer == q.expected : !isNaN(q.answer)
      ).length
    },
    progress() {
      return (this.answered / this.questions.length) * 100
    }
  },
  props: {
    title: { type: String },
    questions: { required: true, type: Array }
  },
  data() {
    return {
      graded: false,
      activeStep: 0
    }
  }
}
</script>
