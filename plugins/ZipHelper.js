import JSZip from 'jszip'

export default class {
  constructor() {
    this.zip = new JSZip()
  }

  generateBlobAsync() {
    return this.zip.generateAsync({ type: 'blob' })
  }

  generateBase64Async() {
    return this.zip.generateAsync({ type: 'base64' })
  }

  download(filename) {
    this.generateBlobAsync().then(blob => {
      window.location = window.URL.createObjectURL(blob)
    })
  }

  downloadAsDataURL() {
    this.generateBase64Async().then(base64 => {
      window.location = 'data:application/zip;base64,' + base64
    })
  }

  addFile(name, payload) {
    this.zip.file(name, payload)
  }

  static getFileFromZipAsync(blob, name, type) {
    return JSZip.loadAsync(blob).then(zip =>
      zip.file(name).async(type || 'string')
    )
  }
}
