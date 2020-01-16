import {ParamType} from 'src/engine/poly/ParamType';

QUnit.test('color eval correctly when set to different values', async (assert) => {
	const geo1 = window.geo1;

	const color = geo1.add_param(ParamType.COLOR, 'debug', [1, 1, 1], {spare: true})!;
	assert.deepEqual(color.value.toArray(), [1, 1, 1]);

	color.r.set(0);
	assert.deepEqual(color.value.toArray(), [0, 1, 1]);

	color.g.set(0.5);
	assert.deepEqual(color.value.toArray(), [0, 0.5, 1]);

	color.b.set(0.7);
	assert.deepEqual(color.value.toArray(), [0, 0.5, 0.7]);

	color.r.set('5*2');
	assert.ok(color.r.has_expression());
	assert.ok(color.has_expression());
	await color.compute();
	assert.deepEqual(color.r.value, 10);
	assert.deepEqual(color.value.toArray(), [10, 0.5, 0.7]);
});
