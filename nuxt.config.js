
module.exports = {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
     script: [
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  '~/plugins/loader',
  '~/plugins/jsonviewer',
   {src:'~/plugins/vue-window',ssr:false},

   //{src:'~/plugins/sw.js',ssr:false},
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://buefy.github.io/#/documentation
    'nuxt-buefy',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
  },
  pwa:{
  workbox:{
   // config:{debug:true},
    workboxURL:'https://cdn.jsdelivr.net/npm/workbox-cdn/workbox/workbox-sw.js',
    //importScripts:['service-worker.js'],
    cachingExtensions: '@/plugins/service-worker.js'

  }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  },
  env: {
    title:'Forge Tools Hub ',
    viewerScriptURL: 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js',
    viewerStyleURL: 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css',
    manifestURL: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/:urn/manifest',
    deriviateURL: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/:urn/manifest/:derivativeURN',
    uploadURLResumable: 'https://developer.api.autodesk.com/oss/v2/buckets/:objectKey/resumable',
    uploadURL: 'https://developer.api.autodesk.com/oss/v2/buckets/:objectKey',
    swaggerUIURL: 'https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js',
    swaggerCSSURL: 'https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css',
    tutorialDataURL:process.env.tutorialDataURL,
    topicDataURL:process.env.topicDataURL,
    jsonbinSecret:process.env.jsonbinSecret,
    hubSwaggerDataURL:process.env.hubSwaggerDataURL,
  }
}
