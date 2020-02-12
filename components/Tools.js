export default {
  getRandomString(length) {
    return Math.random()
      .toString(36)
      .substring((length || 6) + 1)
  },
  formatURL(url, obj) {
    return Object.entries(obj).reduce(
      (o, e) => o.replace(':' + e[0], e[1]),
      url
    )
  },

  formatObj(obj, format, ignored) {
    obj = Object.assign({}, obj)
    Object.entries(obj).forEach(e => {
      if (!(ignored instanceof Array) || !ignored.includes(e[0]))
        obj[e[0]] = this.formatURL(e[1], format)
    })
    return obj
  },

  getExtension(urn) {
    return urn.split('.').pop()
  },
  getChunkHeadObjects(length, chunklength) {
    let start = -1,
      end = -1
    return chunklength > 0
      ? [
          ...new Array(
            Math.floor(length / chunklength) + (length % chunklength ? 1 : 0)
          )
        ].map(() => {
          start = end + 1
          end = (end += chunklength) < length - 1 ? end : length - 1
          return {
            start,
            end,
            length: end == length - 1 ? length % chunklength : chunklength
          }
        })
      : [null]
  },
  joinPath(uri, path) {
    const parts = uri.split('/')
    return (
      parts[0] +
      new URL(path, ['http://sb233', ...parts.slice(1)].join('/')).pathname
    )
  },
  bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes == 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
  },
  getURN(derivativeURN) {
    return derivativeURN.split('/')[0].split(':')[3]
  },
  validatePath(path) {
    return ![...path].some(c => [':', '?', '*', '<', '>', '|'].includes(c))
  },
  getMessageObject(message) {
    return Object.assign(
      typeof message == 'object' && message.message
        ? Object.assign({ message: message.message }, message)
        : { message: message.toString() },
      { timestamp: Date.now() }
    )
  },
  form2Json(str) {
    let obj, i, pt, keys, j, ev
    const br = function(repl) {
      if (repl.indexOf(']') !== -1) {
        return repl.replace(/\](.+?)(,|$)/g, function($1, $2, $3) {
          return form2Json.br($2 + '}' + $3)
        })
      }
      return repl
    }

    str = '{"' + (str.indexOf('%') !== -1 ? decodeURI(str) : str) + '"}'
    obj = str
      .replace(/\=/g, '":"')
      .replace(/&/g, '","')
      .replace(/\[/g, '":{"')
    obj = JSON.parse(
      obj.replace(/\](.+?)(,|$)/g, function($1, $2, $3) {
        return br($2 + '}' + $3)
      })
    )
    pt = ('&' + str)
      .replace(/(\[|\]|\=)/g, '"$1"')
      .replace(/\]"+/g, ']')
      .replace(/&([^\[\=]+?)(\[|\=)/g, '"&["$1]$2')
    pt = (pt + '"').replace(/^"&/, '').split('&')
    for (i = 0; i < pt.length; i++) {
      ev = obj
      keys = pt[i].match(/(?!:(\["))([^"]+?)(?=("\]))/g)
      for (j = 0; j < keys.length; j++) {
        if (!ev.hasOwnProperty(keys[j])) {
          if (keys.length > j + 1) {
            ev[keys[j]] = {}
          } else {
            ev[keys[j]] = pt[i].split('=')[1].replace(/"/g, '')
            break
          }
        }
        ev = ev[keys[j]]
      }
    }
    return obj
  },
  objectToFormStr(obj, encode) {
    return Object.entries(obj)
      .map(
        e =>
          (encode === false ? e[0] : encodeURIComponent(e[0])) +
          '=' +
          (encode === false ? e[1] : encodeURIComponent(e[1]))
      )
      .join('&')
  }
}
