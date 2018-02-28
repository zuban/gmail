const path = require('path');
const serverConfig = require('../../config/server.webpack.config');

let config = serverConfig({
    serverName: 'gmail',
    entry: [path.resolve(__dirname, './index.js')],
});

module.exports = config;
