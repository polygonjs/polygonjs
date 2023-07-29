import type {QUnit} from '../helpers/QUnit';
import {ThreeToGl} from '../../src/core/ThreeToGl';
export function testcoreThreeToGl(qUnit: QUnit) {

qUnit.test('ThreeToGl.float', (assert) => {
	assert.equal(ThreeToGl.float(1), '1.0');
	assert.equal(ThreeToGl.float(1.5), '1.5');
	assert.equal(ThreeToGl.float('0.0'), '0.0');
	assert.equal(ThreeToGl.float('0.5'), '0.5');
	assert.equal(ThreeToGl.float('2'), '2.0');
	assert.equal(ThreeToGl.float('Abc'), 'Abc');
});

qUnit.test('ThreeToGl.integer', (assert) => {
	assert.equal(ThreeToGl.integer(1), '1');
	assert.equal(ThreeToGl.integer(1.5), '1');
	assert.equal(ThreeToGl.integer('0.0'), '0');
	assert.equal(ThreeToGl.integer('0.5'), '0');
	assert.equal(ThreeToGl.integer('Abc'), 'Abc');
});

}