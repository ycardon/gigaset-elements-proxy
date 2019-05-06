// build script for gigaset-elements-proxy
//
// run with 'npm run build'

var replace = require('replace-in-file');
const package = require("./package.json");

console.info('builing gigaset-elements-proxy : v' +  package.version)

console.info('> replacing version in:')

console.log(replace.sync({
    files: 'README.md',
    from: /# gigaset-elements-proxy v(.*)/g,
    to: '# gigaset-elements-proxy v' + package.version,
}))

console.log(replace.sync({
    files: 'src/environment/environment.ts',
    from: /version: '(.*)'/g,
    to: 'version: \''+ package.version + '\'',
}))

console.info('> buiding done')
