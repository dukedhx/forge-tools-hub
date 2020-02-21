import tools from './Tools'
import Zip from './ZipHelper'

export default class {
  constructor({ axios, token, timeout }) {
    this.axios = axios
    this.cancelToken = axios && axios.CancelToken
    this.cancelSources = {}
    this.config = { headers: token ? { Authorization: 'Bearer ' + token } : {} }
  }

  execute(method, url, headers, data) {
    return this.axios({
      method,
      url,
      data,
      headers
    })
  }
  rawPost(path, params) {
    const form = document.createElement('form')
    form.method = 'post'
    form.action = path
    form.target = '_blank'
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const hiddenField = document.createElement('input')
        hiddenField.type = 'hidden'
        hiddenField.name = key
        hiddenField.value = params[key]

        form.appendChild(hiddenField)
      }
    }

    document.body.appendChild(form)
    form.submit()
    form.remove()
  }

  getHeaders(headers, base) {
    return Object.assign(base || {}, this.config.headers, headers || {})
  }

  async get(url, config, name) {
    return await this.getAsync(url, config, name)
  }

  putAsync(url, data, range, name) {
    return this.axios.put(
      url,
      data,
      this.getCancelToken(name, {
        headers: this.getHeaders(
          { 'Content-Type': 'application/stream' },
          range
        )
      })
    )
  }

  putObjectAsync(objectKey, data, range, name) {
    return this.putAsync(
      tools.formatURL(
        range && range['Content-Range']
          ? process.env.uploadURLResumable
          : process.env.uploadURL,
        { objectKey }
      ),
      data,
      range,
      name
    )
  }

  getBlobAsync(url, range, name) {
    return this.getAsync(
      url,
      { responseType: 'blob', headers: this.getHeaders(range) },
      name
    )
  }

  async getInfo(url, headers, name) {
    return (
      await this.axios.head(
        url,
        this.getCancelToken(name, { headers: this.getHeaders(headers) })
      )
    ).headers
  }

  async getDerivativeInfo(derivativeURN, headers, name) {
    return this.getInfo(
      tools.formatURL(process.env.deriviateURL, {
        urn: tools.getURN(derivativeURN),
        derivativeURN
      }),
      headers,
      name
    )
  }

  getAsync(url, config, name) {
    return this.axios.get(
      url,
      this.getCancelToken(name, Object.assign({}, this.config, config))
    )
  }

  async getManifest(urn, name) {
    return (
      await this.getAsync(tools.formatURL(process.env.manifestURL, { urn }))
    ).data
  }

  async getSVFAssets(svfblob, urn) {
    return JSON.parse(await Zip.getFileFromZipAsync(svfblob, 'manifest.json'))
      .assets.filter(e => tools.validatePath(e.URI))
      .map(e => tools.joinPath(urn, e.URI))
  }

  getDerivativesAsync(urn, derivativeURN, range, name) {
    return this.getBlobAsync(
      tools.formatURL(process.env.deriviateURL, { urn, derivativeURN }),
      range,
      name
    )
  }

  cancel({ source, name, msg }) {
    ;(source || cancelSources[name]).cancel(
      msg || 'Operation canceled by the user.'
    )
  }

  getCancelToken(name, config) {
    const source = this.cancelToken.source()
    if (config) config.cancelToken = source.token
    this.cancelSources[name || tools.getRandomString()] = source
    return config || source
  }

  terminate(msg) {
    Object.values(this.cancelSources).forEach(e =>
      this.cancel({ source: e, msg })
    )
  }
}
