import { strictEqual } from 'node:assert'
import { EventEmitter } from 'node:events'
import rdf from '@rdfjs/data-model'
import { describe, it } from 'mocha'
import { quadEqual } from 'rdf-test/assert.js'
import FilterStream from '../index.js'

function streamToPromise (stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

function streamToPromiseError (stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', reject)
    stream.on('error', resolve)
  })
}

describe('rdf-stream-filter', () => {
  it('should be a constructor', () => {
    strictEqual(typeof FilterStream, 'function')
  })

  it('should forward the end event', () => {
    const input = new EventEmitter()
    const filter = new FilterStream(input)
    let emitted = false

    filter.on('end', () => {
      emitted = true
    })

    const result = streamToPromise(input).then(() => {
      strictEqual(emitted, true)
    })

    input.emit('end')

    return result
  })

  it('should forward the error event', () => {
    const input = new EventEmitter()
    const filter = new FilterStream(input)
    let emitted = false

    filter.on('error', () => {
      emitted = true
    })

    const result = streamToPromiseError(input).then(() => {
      strictEqual(emitted, true)
    })

    input.emit('error')

    return result
  })

  it('should forward the prefix event', () => {
    const input = new EventEmitter()
    const filter = new FilterStream(input)
    let emittedMap = null

    filter.on('prefix', map => {
      emittedMap = map
    })

    const result = streamToPromise(input).then(() => {
      strictEqual(emittedMap, 'example')
    })

    input.emit('prefix', 'example')
    input.emit('end')

    return result
  })

  it('should use a quad pattern filter', () => {
    const subject = rdf.namedNode('http://example.org/subject')
    const predicate = rdf.namedNode('http://example.org/predicate')
    const object = rdf.namedNode('http://example.org/object')
    const graph = rdf.namedNode('http://example.org/graph')
    const quad = rdf.quad(subject, predicate, object, graph)
    const input = new EventEmitter()
    const filter = new FilterStream(input, subject, predicate, object, graph)
    const output = []

    filter.on('data', quad => {
      output.push(quad)
    })

    const result = streamToPromise(filter).then(() => {
      strictEqual(output.length, 1)
      quadEqual(output[0], quad)
    })

    input.emit('data', quad)
    input.emit('end')

    return result
  })

  it('should check subject in quad pattern filter', () => {
    const subject1 = rdf.namedNode('http://example.org/subject1')
    const subject2 = rdf.namedNode('http://example.org/subject2')
    const predicate = rdf.namedNode('http://example.org/predicate')
    const object = rdf.namedNode('http://example.org/object')
    const graph = rdf.namedNode('http://example.org/graph')
    const quad1 = rdf.quad(subject1, predicate, object, graph)
    const quad2 = rdf.quad(subject2, predicate, object, graph)
    const input = new EventEmitter()
    const filter = new FilterStream(input, subject1, predicate, object, graph)
    const output = []

    filter.on('data', quad => {
      output.push(quad)
    })

    const result = streamToPromise(filter).then(() => {
      strictEqual(output.length, 1)
      quadEqual(output[0], quad1)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })

  it('should check predicate in quad pattern filter', () => {
    const subject = rdf.namedNode('http://example.org/subject')
    const predicate1 = rdf.namedNode('http://example.org/predicate1')
    const predicate2 = rdf.namedNode('http://example.org/predicate2')
    const object = rdf.namedNode('http://example.org/object')
    const graph = rdf.namedNode('http://example.org/graph')
    const quad1 = rdf.quad(subject, predicate1, object, graph)
    const quad2 = rdf.quad(subject, predicate2, object, graph)
    const input = new EventEmitter()
    const filter = new FilterStream(input, subject, predicate1, object, graph)
    const output = []

    filter.on('data', quad => {
      output.push(quad)
    })

    const result = streamToPromise(filter).then(() => {
      strictEqual(output.length, 1)
      quadEqual(output[0], quad1)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })

  it('should check object in quad pattern filter', () => {
    const subject = rdf.namedNode('http://example.org/subject')
    const predicate = rdf.namedNode('http://example.org/predicate')
    const object1 = rdf.namedNode('http://example.org/object1')
    const object2 = rdf.namedNode('http://example.org/object2')
    const graph = rdf.namedNode('http://example.org/graph')
    const quad1 = rdf.quad(subject, predicate, object1, graph)
    const quad2 = rdf.quad(subject, predicate, object2, graph)
    const input = new EventEmitter()
    const filter = new FilterStream(input, subject, predicate, object1, graph)
    const output = []

    filter.on('data', quad => {
      output.push(quad)
    })

    const result = streamToPromise(filter).then(() => {
      strictEqual(output.length, 1)
      quadEqual(output[0], quad1)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })

  it('should check graph in quad pattern filter', () => {
    const subject = rdf.namedNode('http://example.org/subject')
    const predicate = rdf.namedNode('http://example.org/predicate')
    const object = rdf.namedNode('http://example.org/object')
    const graph1 = rdf.namedNode('http://example.org/graph1')
    const graph2 = rdf.namedNode('http://example.org/graph2')
    const quad1 = rdf.quad(subject, predicate, object, graph1)
    const quad2 = rdf.quad(subject, predicate, object, graph2)
    const input = new EventEmitter()
    const filter = new FilterStream(input, subject, predicate, object, graph1)
    const output = []

    filter.on('data', quad => {
      output.push(quad)
    })

    const result = streamToPromise(filter).then(() => {
      strictEqual(output.length, 1)
      quadEqual(output[0], quad1)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })

  it('should use a callback filter if second argument is a function', () => {
    const subject = rdf.namedNode('http://example.org/subject')
    const predicate = rdf.namedNode('http://example.org/predicate')
    const object = rdf.namedNode('http://example.org/object')
    const graph1 = rdf.namedNode('http://example.org/graph1')
    const graph2 = rdf.namedNode('http://example.org/graph2')
    const quad1 = rdf.quad(subject, predicate, object, graph1)
    const quad2 = rdf.quad(subject, predicate, object, graph2)
    const input = new EventEmitter()
    const filter = new FilterStream(input, quad => {
      return quad.graph.equals(graph1)
    })
    const output = []

    filter.on('data', quad => {
      output.push(quad)
    })

    const result = streamToPromise(filter).then(() => {
      strictEqual(output.length, 1)
      quadEqual(output[0], quad1)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })
})
