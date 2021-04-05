import {CorePoint} from '../../../../src/core/geometry/Point';
import {RampPoint, RampValue, RampInterpolation} from '../../../../src/engine/params/ramp/RampValue';

QUnit.test('attrib_remap simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attrib_create1 = geo1.createNode('attribCreate');
	const attrib_remap1 = geo1.createNode('attribRemap');
	attrib_create1.setInput(0, plane1);
	attrib_remap1.setInput(0, attrib_create1);

	attrib_create1.p.name.set('test');
	attrib_create1.p.value1.set('@ptnum*0.25');
	attrib_remap1.p.name.set('test');
	const ramp_value = new RampValue(RampInterpolation.LINEAR, [
		new RampPoint(0, 0),
		new RampPoint(0.5, 1),
		new RampPoint(1, 0),
	]);
	attrib_remap1.p.ramp.set(ramp_value);

	let container, core_group, values;
	container = await attrib_create1.compute();
	core_group = container.coreContent()!;
	values = core_group.points().map((p: CorePoint) => p.attribValue('test'));
	assert.deepEqual(values, [0, 0.25, 0.5, 0.75]);

	container = await attrib_remap1.compute();
	core_group = container.coreContent()!;
	values = core_group.points().map((p: CorePoint) => p.attribValue('test') as number);
	console.log('values', values);
	assert.equal(values[0], 0);
	assert.equal(values[1], 0.625);
	assert.equal(values[2], 1);
	assert.equal(values[3], 0.625);
});
