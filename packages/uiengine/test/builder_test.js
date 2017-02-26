const fs = require('fs-extra')
const path = require('path')
const Factory = require('./support/factory')
const assertExists = require('./support/assertExists')
const assertContentMatches = require('./support/assertContentMatches')
const Builder = require('../src/builder')
const NavigationData = require('../src/data/navigation')

const { testProjectPath } = require('./support/paths')
const tmpPath = path.resolve(__dirname, 'tmp')
const target = path.resolve(tmpPath, 'site')

const state = {
  config: {
    name: 'Builder Test',
    version: '0.1.0',
    update: Date.now(),
    source: {
      base: testProjectPath,
      configFile: path.resolve(testProjectPath, 'uiengine.yml'),
      components: path.resolve(testProjectPath, 'src', 'components'),
      templates: path.resolve(testProjectPath, 'src', 'templates'),
      pages: path.resolve(testProjectPath, 'src', 'uiengine', 'pages'),
      schema: path.resolve(testProjectPath, 'src', 'uiengine', 'schema'),
      data: path.resolve(testProjectPath, '..', 'fixtures')
    },
    target,
    adapters: {
      pug: {
        module: 'uiengine-adapter-pug',
        options: {
          pretty: true,
          basedir: path.resolve(testProjectPath, 'src', 'components')
        }
      },
      jsx: {
        module: 'uiengine-adapter-react',
        options: {}
      },
      hbs: {
        module: 'uiengine-adapter-handlebars',
        options: {}
      }
    },
    templates: {
      variant: path.resolve(testProjectPath, 'src', 'templates', 'variant-preview.pug'),
      custom: path.resolve(testProjectPath, 'src', 'templates', 'other-page.pug'),
      page: path.resolve(testProjectPath, 'src', 'templates', 'page.pug')
    },
    theme: {
      module: 'uiengine-theme-default',
      options: {}
    }
  },
  pages: {
    index: Factory.page('index', {
      title: 'Home',
      childIds: ['patterns'],
      files: [
        path.resolve(testProjectPath, 'src', 'uiengine', 'pages', 'extra-files', 'file-in-folder.txt'),
        path.resolve(testProjectPath, 'src', 'uiengine', 'pages', 'index.txt')
      ]
    }),
    patterns: Factory.page('patterns', {
      title: 'Pattern Library',
      path: 'pattern-library',
      files: [
        path.resolve(testProjectPath, 'src', 'uiengine', 'pages', 'patterns', 'patterns-file.txt'),
        path.resolve(testProjectPath, 'src', 'uiengine', 'pages', 'patterns', 'some-files', 'file-in-folder.txt')
      ],
      componentIds: ['input']
    }),
    prototype: Factory.page('prototype', {
      title: 'Sandbox',
      path: 'prototype',
      childIds: ['prototype/custom-page']
    }),
    'prototype/custom-page': Factory.page('prototype/custom-page', {
      title: 'Custom Page',
      template: 'custom',
      content: 'Content for custom template',
      context: {
        myContextVariable: 'This is my context'
      }
    }),
    schema: Factory.page('schema', {
      title: 'Schema',
      path: '_schema',
      type: 'schema'
    })
  },
  navigation: {
    'index': NavigationData('index', 'index', 'Home', '', 'documentation', [], null, ['patterns']),
    'patterns': NavigationData('patterns', 'patterns', 'Pattern Library', 'pattern-library', 'documentation', ['index'], 'index', { childIds: ['patterns/input'] }),
    'patterns/input': NavigationData('patterns/input', 'input', 'Awesome Input', 'pattern-library/input', 'component', ['index', 'patterns'], 'patterns'),
    'prototype': NavigationData('prototype', 'prototype', 'Sandbox', 'prototype', 'documentation', ['index'], 'index'),
    'prototype/custom-page': NavigationData('prototype/custom-page', 'prototype/custom-page', 'Custom Page', 'prototype/custom-page', 'custom', ['index', 'prototype'], 'prototype'),
    'schema': NavigationData('schema', 'schema', 'Schema', '_schema', 'schema')
  },
  components: {
    input: Factory.component('input', {
      title: 'Awesome Input',
      variantIds: ['input/text.pug'],
      content: '<p>An input field that can be used inside a form.</p>'
    })
  },
  variants: {
    'input/text.pug': {
      id: 'input/text.pug',
      componentId: 'input',
      path: path.resolve(testProjectPath, 'src', 'components', 'input', 'variants', 'text.pug'),
      content: '<p>This is documentation for the text input.</p>',
      rendered: '<input class="input input--text" id="name" name="person[name]" type="text"/>',
      context: { id: 'name', name: 'person[name]' },
      title: 'Text Input'
    }
  },
  schema: {
    'Entity': {
      title: {
        type: 'String',
        description: 'Title',
        required: true
      },
      date: {
        type: 'Date',
        description: 'Publising date',
        required: true
      },
      customObject: {
        type: 'CustomObject',
        description: 'A custom object'
      }
    },
    'CustomObject': {
      tags: {
        type: 'Array',
        description: 'Tags as strings'
      },
      isHidden: {
        type: 'Boolean',
        default: 'false',
        description: 'Entity should be hidden'
      }
    }
  }
}

describe('Builder', () => {
  afterEach(() => { fs.removeSync(tmpPath) })

  describe('#generateSite', () => {
    it('should generate site', function (done) {
      this.timeout(5000)

      Builder.generateSite(state)
        .then(() => {
          assertExists(path.join(target, 'index.html'))
          assertExists(path.join(target, 'pattern-library', 'index.html'))
          assertExists(path.join(target, 'prototype', 'index.html'))
          assertExists(path.join(target, 'prototype', 'custom-page', 'index.html'))

          done()
        })
        .catch(done)
    })
  })

  describe('#generatePage', () => {
    it('should generate page', done => {
      Builder.generatePage(state, 'index')
        .then(() => {
          const pagePath = path.join(target, 'index.html')

          assertContentMatches(pagePath, '<title>Home • Builder Test')

          done()
        })
        .catch(done)
    })

    it('should generate page with custom path', done => {
      Builder.generatePage(state, 'patterns')
        .then(() => {
          const pagePath = path.join(target, 'pattern-library', 'index.html')

          assertContentMatches(pagePath, '<title>Pattern Library • Builder Test')

          done()
        })
        .catch(done)
    })

    it('should generate page with custom template', done => {
      Builder.generatePage(state, 'prototype/custom-page')
        .then(() => {
          const pageTypePath = path.join(target, 'prototype', 'custom-page', 'index.html')
          const pageTemplatePath = path.join(target, 'prototype', 'custom-page', '_custom.html')

          assertContentMatches(pageTypePath, '<title>Custom Page • Builder Test')
          assertContentMatches(pageTemplatePath, /^This is the custom template<br\/>This is my context$/)

          done()
        })
        .catch(done)
    })
  })

  describe('#generatePage with "schema"', () => {
    it('should generate schema page', done => {
      Builder.generatePage(state, 'schema')
        .then(state => {
          const pagePath = path.join(target, '_schema', 'index.html')

          assertContentMatches(pagePath, /Entity/)
          assertContentMatches(pagePath, /CustomObject/)

          done()
        })
        .catch(done)
    })
  })

  describe('#copyPageFiles', () => {
    it('should copy page files', done => {
      Builder.copyPageFiles(state, 'index')
        .then(() => {
          assertExists(path.join(target, 'index.txt'))

          done()
        })
        .catch(done)
    })

    it('should copy page files in extra folder', done => {
      Builder.copyPageFiles(state, 'index')
        .then(() => {
          assertExists(path.join(target, 'extra-files', 'file-in-folder.txt'))

          done()
        })
        .catch(done)
    })

    it('should copy page files for pages with custom paths', done => {
      Builder.copyPageFiles(state, 'patterns')
        .then(() => {
          assertExists(path.join(target, 'pattern-library', 'patterns-file.txt'))

          done()
        })
        .catch(done)
    })

    it('should copy page files in extra folder for pages with custom paths', done => {
      Builder.copyPageFiles(state, 'patterns')
        .then(() => {
          assertExists(path.join(target, 'pattern-library', 'some-files', 'file-in-folder.txt'))

          done()
        })
        .catch(done)
    })
  })

  describe('#generateComponentForPage', () => {
    it('should generate component page', done => {
      Builder.generateComponentForPage(state, 'patterns', 'input')
        .then(() => {
          assertExists(path.join(target, 'pattern-library', 'input', 'index.html'))

          done()
        })
        .catch(done)
    })
  })

  describe('#generateComponentsForPage', () => {
    it('should generate component pages', done => {
      Builder.generateComponentsForPage(state, 'patterns')
        .then(() => {
          assertExists(path.join(target, 'pattern-library', 'input', 'index.html'))

          done()
        })
        .catch(done)
    })
  })

  describe('#generatePagesHavingComponent', () => {
    it('should generate pages having this component as subpage', done => {
      Builder.generatePagesHavingComponent(state, 'input')
        .then(() => {
          assertExists(path.join(target, 'pattern-library', 'input', 'index.html'))

          done()
        })
        .catch(done)
    })
  })

  describe('#generatePagesHavingTemplate', () => {
    it('should generate pages having this template', done => {
      Builder.generatePagesHavingTemplate(state, 'custom')
        .then(() => {
          assertExists(path.join(target, 'prototype', 'custom-page', 'index.html'))

          done()
        })
        .catch(done)
    })
  })

  describe('#generateComponentVariants', () => {
    it('should generate component variant pages', done => {
      Builder.generateComponentVariants(state, 'input')
        .then(() => {
          assertExists(path.join(target, '_variants', 'input', 'text.pug.html'))

          done()
        })
        .catch(done)
    })
  })

  describe('#generateVariant', () => {
    it('should generate variant page', done => {
      Builder.generateVariant(state, 'input/text.pug')
        .then(() => {
          assertExists(path.join(target, '_variants', 'input', 'text.pug.html'))

          done()
        })
        .catch(done)
    })
  })

  describe('#dumpState', () => {
    it('should generate state file', done => {
      Builder.dumpState(state)
        .then(() => {
          assertExists(path.join(target, 'state.json'))

          done()
        })
        .catch(done)
    })
  })
})