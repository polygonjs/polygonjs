console.log('testing...')

import 'qunit'
import './assertions'

declare global {
	interface Window {
		QUnit: QUnit
	}
}
window.QUnit = QUnit

QUnit.testStart(() => {
	return new Promise(async (resolve, reject) => {
		console.log('init test')

		resolve()
	})
})

QUnit.module('core')
import './core/object'

console.log('Qunit start')
QUnit.start()
console.log('Qunit started')

console.log('test DONE')
