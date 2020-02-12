const encoder = new TextEncoder()

let urn = ''

workbox.routing.setDefaultHandler(({ url, request }) => {
  url = new URL(url)
  const path = url.pathname
  let responsePromise, parts
  if (
    self.urn &&
    url.host == 'developer.api.autodesk.com' &&
    path.startsWith('/derivativeservice') &&
    (parts = path.split(urn + '%2F')).length > 1
  ) {
    responsePromise = fetch(request)
    responsePromise.then(async res => {
      const response = res.clone()

      let finished = false
      const chunks = []
      const reader = response.body.getReader()
      while (true) {
        let { value, done } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      self.postMessage({
        operation: 'URNBlob',
        name:
          parts.length > 2
            ? parts
                .splice(1)
                .map(e => decodeURIComponent(e))
                .join('/')
            : decodeURIComponent(parts[1]),
        payload: new Blob(chunks)
      })
    })
  } else
    responsePromise = self.router
      ? self.router.handleRequest({ url, request })
      : fetch(request)
  return responsePromise
})

self.addEventListener('message', e => {
  console.log(e)
  switch (e.data.operation) {
    case 'fetchURNBlob':
      self.urn = e.data.urn
      self.postMessage({ operation: 'ackURN', urn: self.urn })

      break

    case 'registerURN':
      self.urn = ''
      self.registerRoute(self.getURNURL(e.data.urn), e.data.urn)
      self.postMessage({ operation: 'ackURN', urn: e.data.urn })
      break
    case 'registerViewer':
      self.registerRoute(
        'https://developer.api.autodesk.com/modelderivative/v2/viewers/',
        'forge-viewer-library'
      )

      self.postMessage({ operation: 'registerViewer' })
      console.log(self.router.routes)
      break
    case 'registerRoute':
      self.registerRoute(self.getURNURL(e.data.route), e.data.route)
      self.postMessage({ operation: 'ackRoute', route: e.data.route })
      break

    case 'unregisterRoute':
      self.unregisterRoute(e.data.name)
      self.postMessage({ operation: 'unregisterRoute', route: e.data.name })

      break

    case 'unregisterViewer':
      self.unregisterRoute('forge-viewer-library')

      self.postMessage({ operation: 'unregisterViewer' })
  }
})

function isValidRoute(url) {
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}

function isValidURN(urn) {
  try {
    atob(urn)
    return true
  } catch (err) {
    return false
  }
}

function getRoute(route) {
  return new RegExp(
    '^(' +
      (route instanceof Array
        ? route.map(e => self.escapeRegex(e)).join('|')
        : self.escapeRegex(route)) +
      ')'
  )
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}
function postMessage(message) {
  //console.log(message);
  self.clients.matchAll().then(clients => clients[0].postMessage(message))
}

function registerRoute(route, cacheName) {
  self.defaultplugins = self.defaultplugins || [
    new workbox.cacheableResponse.Plugin({
      statuses: [0, 200]
    })
  ]
  self.router = self.router || new workbox.routing.Router()
  self.router.setDefaultHandler(({ request }) => fetch(request))
  const routes = self.router.routes.get('GET')
  if (!routes || !routes.find(e => e.handler._cacheName == cacheName))
    self.router.registerRoute(
      new workbox.routing.RegExpRoute(
        self.getRoute(route),
        new workbox.strategies.CacheFirst({
          cacheName,
          plugins: self.defaultplugins
        })
      )
    )
}

function unregisterRoute(cacheName) {
  self.router.unregisterRoute(
    self.router.routes.get('GET').find(e => e.handler._cacheName == cacheName)
  )
  caches.delete(cacheName)
}

function getURNURL(urn) {
  return [
    'https://developer.api.autodesk.com/derivativeservice/v2/derivatives/urn%3Aadsk.viewing%3Afs.file%3A<urn>'.replace(
      '<urn>',
      urn
    ),
    'https://developer.api.autodesk.com/derivativeservice/v2/manifest/<urn>'.replace(
      '<urn>',
      urn
    )
  ]
}
