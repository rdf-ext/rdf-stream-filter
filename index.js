'use strict'

const Readable = require('readable-stream')

function buildQuadFilter (subject, predicate, object, graph) {
  return function (quad) {
    // TODO: implement RegExp support

    if (subject && !quad.subject.equals(subject)) {
      return false
    }

    if (predicate && !quad.predicate.equals(predicate)) {
      return false
    }

    if (object && !quad.object.equals(object)) {
      return false
    }

    if (graph && !quad.graph.equals(graph)) {
      return false
    }

    return true
  }
}

class FilterStream extends Readable {
  constructor (input, subject, predicate, object, graph) {
    super()

    this._readableState.objectMode = true

    let filter = typeof subject === 'function' ? subject : buildQuadFilter(subject, predicate, object, graph)

    input.once('close', () => {
      this.emit('close')
    })

    input.on('data', (quad) => {
      if (filter(quad)) {
        this.push(quad)
      }
    })

    input.on('end', () => {
      this.emit('end')
    })

    input.on('error', (err) => {
      this.emit('error', err)
    })

    input.on('prefix', (map) => {
      this.emit('prefix', map)
    })
  }

  _read () {
  }
}

module.exports = FilterStream
