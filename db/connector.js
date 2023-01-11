const path = require('path');
const fs = require('fs');

const plugins = {}

const pluginsPath = path.join(__dirname, 'plugins')

const fileNames = fs.readdirSync(pluginsPath)

fileNames.forEach(fileName => {

    if (!fileName.endsWith('.example') && !fileName.endsWith('.disable')) {

        const pluginName = fileName.split('.')[0]

        logger.log('debug', 'Registering plugin for %s', pluginName)

        plugins[pluginName] = require(path.join(pluginsPath, fileName))

    }

})

module.exports = plugins
