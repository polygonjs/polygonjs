import {CoreMath} from '../../src/core/math/_Module';
import {Triangle} from 'three';
import {Vector3} from 'three';

QUnit.test('math: expandTriangle', (assert) => {
	const p0 = new Vector3(0, 0, 0);
	const p1 = new Vector3(1, 0, 0);
	const p2 = new Vector3(0, 0, 1);
	const triangle = new Triangle(p0, p1, p2);
	CoreMath.expandTriangle(triangle, 0.5);
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

QUnit.test('pow2Inverse', (assert) => {
	assert.equal(CoreMath.pow2Inverse(2), 1);
	assert.equal(CoreMath.pow2Inverse(4), 2);
	assert.equal(CoreMath.pow2Inverse(8), 3);
	assert.equal(CoreMath.pow2Inverse(16), 4);
});
