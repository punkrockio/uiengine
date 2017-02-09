/* global describe, it */
const assert = require('assert')
const assertExists = require('./support/assertExists')
const fs = require('fs-extra')
const path = require('path')

const File = require('../lib/util/file')

describe('File', () => {
  describe('#read', () => {
    it('should return file content', done => {
      File.read('./test/fixtures/markdown.md')
        .then(data => {
          assert.equal(data, '# Homepage\n\nWelcome!\n')
          done()
        })
        .catch(done)
    })
  })

  describe('#write', () => {
    it('should write content to file', done => {
      const filePath = './test/tmp/writeFileTest.txt'
      File.write(filePath, 'Test')
        .then(() => {
          const content = fs.readFileSync(filePath)
          assert.equal(content, 'Test')
          fs.removeSync(filePath)
          done()
        })
        .catch(done)
    })
  })

  describe('#copy', () => {
    it('should copy file from source to destination', done => {
      const src = './test/fixtures/frontmatter.txt'
      const dst = './test/tmp/frontmatter.txt'
      File.copy(src, dst)
        .then(() => {
          assertExists(dst)
          fs.removeSync(dst)
          done()
        })
        .catch(done)
    })

    it('should copy directory from source to destination', done => {
      const src = './test/fixtures'
      const dst = './test/tmp/fixtures'
      File.copy(src, dst)
        .then(() => {
          assertExists(path.join(dst, 'yaml.yml'))
          fs.removeSync(dst)
          done()
        })
        .catch(done)
    })
  })
})
