const merge = require('webpack-merge')
const common = require('./common.js')

module.exports = (env) => {
	return merge(common, {
		mode: 'production',
	})
}
