require('mocha-sinon')()

const assert = require('assert')
const { resolve } = require('path')

const Connector = require('../src/connector')

const { testProjectPath, testTmpPath } = require('../../../test/support/paths')
const testAdapterPath = resolve(__dirname, 'fixtures', 'test-adapter')
const noopAdapterPath = resolve(__dirname, 'fixtures', 'noop-adapter')
const components = resolve(testProjectPath, 'src', 'components')
const templates = resolve(testProjectPath, 'src', 'templates')
const target = testTmpPath
const testFilePath = resolve(components, 'form', 'form.test')
const testAdapterOptions = { basedir: components }
const expandedAdapterOptions = Object.assign({}, testAdapterOptions, { components, templates, target, ext: 'test' })
const TestAdapter = require(testAdapterPath)

const stateWithModule = module => ({
  config: {
    source: {
      components,
      templates
    },
    target,
    adapters: {
      test: {
        module,
        options: testAdapterOptions
      }
    }
  }
})

const state = stateWithModule(testAdapterPath)
const stateNoop = stateWithModule(noopAdapterPath)

describe('Connector', () => {
  afterEach(function () {
    this.sinon.restore()
  })

  it('should throw error if the adapter cannot be resolved', async () => {
    const stateWithNonExistingAdapter = stateWithModule('doesnotexist')

    try {
      await Connector.setup(stateWithNonExistingAdapter)
    } catch (error) {
      assert(error)
    }
  })

  describe('#setup', () => {
    it('should call the adapters setup function', async function () {
      this.sinon.stub(TestAdapter, 'setup')
      await Connector.setup(state)

      this.sinon.assert.calledOnce(TestAdapter.setup)
      this.sinon.assert.calledWith(TestAdapter.setup, expandedAdapterOptions)
    })

    it('should be no op if there are no adapters', async function () {
      this.sinon.stub(TestAdapter, 'setup')
      const state = { config: { source: { components, templates }, adapters: { } } }
      await Connector.setup(state)

      assert(TestAdapter.setup.notCalled)
    })
  })

  describe('#registerComponentFile', () => {
    it('should call the adapters registerComponentFile function', async function () {
      this.sinon.stub(TestAdapter, 'registerComponentFile')
      await Connector.registerComponentFile(state, testFilePath)

      this.sinon.assert.calledOnce(TestAdapter.registerComponentFile)
      this.sinon.assert.calledWith(TestAdapter.registerComponentFile, expandedAdapterOptions, testFilePath)
    })
  })

  describe('#render', () => {
    it('should call the adapter render function with the options, the template id and data', async function () {
      this.sinon.stub(TestAdapter, 'render').returns('')
      const templatePath = './src/templates/my-template.test'
      const data = { myData: 1 }
      await Connector.render(state, templatePath, data)

      this.sinon.assert.calledOnce(TestAdapter.render)
      this.sinon.assert.calledWith(TestAdapter.render, expandedAdapterOptions, templatePath, data)
    })

    it('should throw error if the adapter does not implement the render function', async () => {
      try {
        await Connector.render(stateNoop, './src/templates/my-template.test', {})
      } catch (error) {
        assert(error)
      }
    })

    it('should throw error if the adapter for the filetype is missing', async () => {
      try {
        await Connector.render(stateNoop, './src/templates/my-template.unknown', {})
      } catch (error) {
        assert(error)
      }
    })
  })

  describe('#filesForComponent', () => {
    it('should call the adapters filesForComponent function', async function () {
      this.sinon.stub(TestAdapter, 'filesForComponent')
      await Connector.filesForComponent(state, 'test', 'button')

      this.sinon.assert.calledOnce(TestAdapter.filesForComponent)
      this.sinon.assert.calledWith(TestAdapter.filesForComponent, 'button')
    })

    it('should return an empty array if the adapter does not implement the filesForComponent function', async () => {
      const result = await Connector.filesForComponent(stateNoop, 'test', 'button')

      assert.equal(result.length, 0)
    })
  })

  describe('#filesForVariant', () => {
    it('should call the adapters filesForVariant function', async function () {
      this.sinon.stub(TestAdapter, 'filesForVariant')
      await Connector.filesForVariant(state, 'test', 'button', 'primary')

      this.sinon.assert.calledOnce(TestAdapter.filesForVariant)
      this.sinon.assert.calledWith(TestAdapter.filesForVariant, 'button', 'primary')
    })

    it('should return an empty array if the adapter does not implement the filesForVariant function', async () => {
      const result = await Connector.filesForVariant(stateNoop, 'test', 'button', 'primary')

      assert.equal(result.length, 0)
    })
  })
})
