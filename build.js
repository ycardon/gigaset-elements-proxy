// build script for gigaset-elements-proxy
//
// run with 'npm run build'

const replace = require('replace-in-file');
const version = require("./package.json").version;

console.info('builing gigaset-elements-proxy : v' + version)

console.info('> replacing version in:')

console.log(replace.sync({
    files: 'README.md',
    from: /# gigaset-elements-proxy v(.*)/g,
    to:   '# gigaset-elements-proxy v' + version,
}))

console.log(replace.sync({
    files: 'src/environment/environment.ts', 
    from: /version: '(.*)'/g,
    to:   'version: \''+ version + '\'',
}))

console.log(replace.sync({
    files: 'package-lock.json', 
    from: /"version": "(.*)"/,
    to:   '"version": "'+ version + '"',
}))

console.info('> buiding done')
