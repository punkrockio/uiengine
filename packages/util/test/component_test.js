const assert = require('assert')
const { join, resolve } = require('path')

const { testProjectPath } = require('../../../test/support/paths')
const ComponentUtil = require('../src/component')

const elementsPath = resolve(testProjectPath, 'src', 'elements')
const modulesPath = resolve(testProjectPath, 'src', 'modules')
const componentPaths = [elementsPath, modulesPath]

describe('ComponentUtil', () => {
  describe('#componentIdToFilePath', () => {
    it('should return component file path for component', () => {
      const filePath = ComponentUtil.componentIdToFilePath(componentPaths, 'formfield')

      assert.strictEqual(filePath, join(modulesPath, 'formfield', 'component.md'))
    })
  })

  describe('#componentFilePathToId', () => {
    it('should return component id for component file path', () => {
      const filePath = join(modulesPath, 'form', 'component.md')
      const componentId = ComponentUtil.componentFilePathToId(componentPaths, filePath)

      assert.strictEqual(componentId, 'form')
    })

    it('should return component id for file path', () => {
      const filePath = join(elementsPath, 'button', 'additional.pdf')
      const componentId = ComponentUtil.componentFilePathToId(componentPaths, filePath)

      assert.strictEqual(componentId, 'button')
    })

    it('should return component id for variant file path', () => {
      const filePath = join(elementsPath, 'button', 'variants', 'button.pug')
      const componentId = ComponentUtil.componentFilePathToId(componentPaths, filePath)

      assert.strictEqual(componentId, 'button')
    })

    it('should return undefined for invalid file path', () => {
      const filePath = join(testProjectPath, 'uiengine', 'pages', 'page.md')
      const componentId = ComponentUtil.componentFilePathToId(componentPaths, filePath)

      assert.strictEqual(componentId, undefined)
    })
  })

  describe('#componentPathToId', () => {
    it('should return component id for component path', () => {
      const elementPath = join(elementsPath, 'button')
      const elementId = ComponentUtil.componentPathToId(componentPaths, elementPath)

      assert.strictEqual(elementId, 'button')

      const modulePath = join(elementsPath, 'form')
      const moduleId = ComponentUtil.componentPathToId(componentPaths, modulePath)

      assert.strictEqual(moduleId, 'form')
    })

    it('should return undefined for invalid component id', () => {
      const filePath = join(testProjectPath, 'uiengine', 'pages', 'page.md')
      const componentId = ComponentUtil.componentPathToId(componentPaths, filePath)

      assert.strictEqual(componentId, undefined)
    })
  })
})
