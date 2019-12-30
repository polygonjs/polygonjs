import {TsLintTest} from 'src/core/tslinttest'

QUnit.test('has expected name', (assert: Assert) => {
	const t = new TsLintTest('ta')
	assert.equal(t.name, 'ta2')
	console.log('ran test')
})
