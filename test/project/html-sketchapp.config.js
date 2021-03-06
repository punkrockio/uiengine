// https://github.com/seek-oss/html-sketchapp-cli#viewport-sizes-and-responsive-design
const viewports = require('./lib/viewports.json')

const viewportsSketch = Object.keys(viewports).reduce((result, name) => {
  const { width, height } = viewports[name]
  result[name] = `${width}x${height}`
  return result
}, {})

module.exports = {
  url: 'http://localhost:3000/_sketch.html',
  outDir: '../tmp/_sketch',
  viewports: viewportsSketch
}
