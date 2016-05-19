'use strict'

/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-data-model')
const EventEmitter = require('events').EventEmitter
const FilterStream = require('..')

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

describe('rdf-filter-stream', () => {
  it('should be a constructor', () => {
    assert.equal(typeof FilterStream, 'function')
  })

  it('should forward the end event', () => {
    let input = new EventEmitter()
    let filter = new FilterStream(input)
    let emitted = false

    filter.on('end', () => {
      emitted = true
    })

    let result = streamToPromise(input).then(() => {
      assert.equal(emitted, true)
    })

    input.emit('end')

    return result
  })

  it('should forward the error event', () => {
    let input = new EventEmitter()
    let filter = new FilterStream(input)
    let emitted = false

    filter.on('error', () => {
      emitted = true
    })

    let result = streamToPromiseError(input).then(() => {
      assert.equal(emitted, true)
    })

    input.emit('error')

    return result
  })

  it('should forward the prefix event', () => {
    let input = new EventEmitter()
    let filter = new FilterStream(input)
    let emittedMap = null

    filter.on('prefix', (map) => {
      emittedMap = map
    })

    let result = streamToPromise(input).then(() => {
      assert.equal(emittedMap, 'example')
    })

    input.emit('prefix', 'example')
    input.emit('end')

    return result
  })

  it('should use a quad pattern filter', () => {
    let subject = rdf.namedNode('http://example.org/subject')
    let predicate = rdf.namedNode('http://example.org/predicate')
    let object = rdf.namedNode('http://example.org/object')
    let graph = rdf.namedNode('http://example.org/graph')
    let quad = rdf.quad(subject, predicate, object, graph)
    let input = new EventEmitter()
    let filter = new FilterStream(input, subject, predicate, object, graph)
    let output = []

    filter.on('data', (quad) => {
      output.push(quad)
    })

    let result = streamToPromise(filter).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].equals(quad), true)
    })

    input.emit('data', quad)
    input.emit('end')

    return result
  })

  it('should check subject in quad pattern filter', () => {
    let subject1 = rdf.namedNode('http://example.org/subject1')
    let subject2 = rdf.namedNode('http://example.org/subject2')
    let predicate = rdf.namedNode('http://example.org/predicate')
    let object = rdf.namedNode('http://example.org/object')
    let graph = rdf.namedNode('http://example.org/graph')
    let quad1 = rdf.quad(subject1, predicate, object, graph)
    let quad2 = rdf.quad(subject2, predicate, object, graph)
    let input = new EventEmitter()
    let filter = new FilterStream(input, subject1, predicate, object, graph)
    let output = []

    filter.on('data', (quad) => {
      output.push(quad)
    })

    let result = streamToPromise(filter).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].equals(quad1), true)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })

  it('should check predicate in quad pattern filter', () => {
    let subject = rdf.namedNode('http://example.org/subject')
    let predicate1 = rdf.namedNode('http://example.org/predicate1')
    let predicate2 = rdf.namedNode('http://example.org/predicate2')
    let object = rdf.namedNode('http://example.org/object')
    let graph = rdf.namedNode('http://example.org/graph')
    let quad1 = rdf.quad(subject, predicate1, object, graph)
    let quad2 = rdf.quad(subject, predicate2, object, graph)
    let input = new EventEmitter()
    let filter = new FilterStream(input, subject, predicate1, object, graph)
    let output = []

    filter.on('data', (quad) => {
      output.push(quad)
    })

    let result = streamToPromise(filter).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].equals(quad1), true)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })

  it('should check object in quad pattern filter', () => {
    let subject = rdf.namedNode('http://example.org/subject')
    let predicate = rdf.namedNode('http://example.org/predicate')
    let object1 = rdf.namedNode('http://example.org/object1')
    let object2 = rdf.namedNode('http://example.org/object2')
    let graph = rdf.namedNode('http://example.org/graph')
    let quad1 = rdf.quad(subject, predicate, object1, graph)
    let quad2 = rdf.quad(subject, predicate, object2, graph)
    let input = new EventEmitter()
    let filter = new FilterStream(input, subject, predicate, object1, graph)
    let output = []

    filter.on('data', (quad) => {
      output.push(quad)
    })

    let result = streamToPromise(filter).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].equals(quad1), true)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })

  it('should check graph in quad pattern filter', () => {
    let subject = rdf.namedNode('http://example.org/subject')
    let predicate = rdf.namedNode('http://example.org/predicate')
    let object = rdf.namedNode('http://example.org/object')
    let graph1 = rdf.namedNode('http://example.org/graph1')
    let graph2 = rdf.namedNode('http://example.org/graph2')
    let quad1 = rdf.quad(subject, predicate, object, graph1)
    let quad2 = rdf.quad(subject, predicate, object, graph2)
    let input = new EventEmitter()
    let filter = new FilterStream(input, subject, predicate, object, graph1)
    let output = []

    filter.on('data', (quad) => {
      output.push(quad)
    })

    let result = streamToPromise(filter).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].equals(quad1), true)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })

  it('should use a callback filter if second argument is a function', () => {
    let subject = rdf.namedNode('http://example.org/subject')
    let predicate = rdf.namedNode('http://example.org/predicate')
    let object = rdf.namedNode('http://example.org/object')
    let graph1 = rdf.namedNode('http://example.org/graph1')
    let graph2 = rdf.namedNode('http://example.org/graph2')
    let quad1 = rdf.quad(subject, predicate, object, graph1)
    let quad2 = rdf.quad(subject, predicate, object, graph2)
    let input = new EventEmitter()
    let filter = new FilterStream(input, (quad) => {
      return quad.graph.equals(graph1)
    })
    let output = []

    filter.on('data', (quad) => {
      output.push(quad)
    })

    let result = streamToPromise(filter).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].equals(quad1), true)
    })

    input.emit('data', quad1)
    input.emit('data', quad2)
    input.emit('end')

    return result
  })
})
