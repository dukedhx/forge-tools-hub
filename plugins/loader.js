import Vue from 'vue'
import JsonViewer from 'vue-json-viewer/ssr'
Vue.use({
  install(Vue, options) {
    Vue.prototype.$loadScript = src => {
      return new Promise(resolve => {
        const ele = document.createElement('script')
        ele.src = src
        ele.onload = () => resolve(src)
        document.head.appendChild(ele)
      })
    }
    Vue.prototype.$loadStyle = src => {
      return new Promise(resolve => {
        const ele = document.createElement('link')
        ele.rel = 'stylesheet'
        ele.href = src
        ele.onload = () => resolve()
        document.head.appendChild(ele)
      })
    }
  }
})
Vue.use(JsonViewer)
