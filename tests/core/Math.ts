import type {QUnit} from '../helpers/QUnit';
import {expandTriangle, pow2Inverse, mod, nearestPower2} from '../../src/core/math/_Module';
import {Triangle} from 'three';
import {Vector3} from 'three';
export function testcoreMath(qUnit: QUnit) {
	qUnit.test('math: expandTriangle', (assert) => {
		const p0 = new Vector3(0, 0, 0);
		const p1 = new Vector3(1, 0, 0);
		const p2 = new Vector3(0, 0, 1);
		const triangle = new Triangle(p0, p1, p2);
		expandTriangle(triangle, 0.5);
		assert.in_delta(triangle.a.x, -0.35, 0.01);
		assert.in_delta(triangle.a.y, 0, 0.01);
		assert.in_delta(triangle.a.z, -0.35, 0.01);
		assert.in_delta(triangle.b.x, 1.44, 0.01);
		assert.in_delta(triangle.b.y, 0, 0.01);
		assert.in_delta(triangle.b.z, -0.22, 0.01);
		assert.in_delta(triangle.c.x, -0.22, 0.01);
		assert.in_delta(triangle.c.y, 0, 0.01);
		assert.in_delta(triangle.c.z, 1.44, 0.01);
	});

	qUnit.test('nearestPower2', (assert) => {
		assert.equal(nearestPower2(0), 0);
		assert.equal(nearestPower2(1), 1);
		assert.equal(nearestPower2(2), 2);
		assert.equal(nearestPower2(3), 4);
		assert.equal(nearestPower2(4), 4);
		assert.equal(nearestPower2(5), 8);
		assert.equal(nearestPower2(6), 8);
		assert.equal(nearestPower2(7), 8);
		assert.equal(nearestPower2(8), 8);
		assert.equal(nearestPower2(9), 16);
	});

	qUnit.test('pow2Inverse', (assert) => {
		assert.equal(pow2Inverse(2), 1);
		assert.equal(pow2Inverse(4), 2);
		assert.equal(pow2Inverse(8), 3);
		assert.equal(pow2Inverse(16), 4);
	});

	qUnit.test('mod for negative numbers', (assert) => {
		assert.equal(mod(5, 2), 1);
		assert.equal(mod(-5, 2), 1);
		assert.equal(mod(0, 4), 0);
		assert.equal(mod(1, 4), 1);
		assert.equal(mod(2, 4), 2);
		assert.equal(mod(3, 4), 3);
		assert.equal(mod(4, 4), 0);
		assert.equal(mod(5, 4), 1);
		assert.equal(mod(6, 4), 2);
		assert.equal(mod(7, 4), 3);
		assert.equal(mod(8, 4), 0);
		assert.equal(mod(9, 4), 1);
		assert.equal(mod(10, 4), 2);
		assert.equal(mod(11, 4), 3);
		assert.equal(mod(12, 4), 0);
		assert.equal(mod(13, 4), 1);
		assert.equal(mod(-1, 4), 3);
		assert.equal(mod(-2, 4), 2);
		assert.equal(mod(-3, 4), 1);
		assert.equal(mod(-4, 4), 0);
		assert.equal(mod(-5, 4), 3);
	});
}
