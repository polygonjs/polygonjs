import {PointLight} from 'three/src/lights/PointLight';
import {TRANSFORM_TARGET_TYPES, TransformTargetType} from '../../../../src/core/Transform';

QUnit.test('pointLight simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const pointLight = geo1.createNode('pointLight');

	let container = await pointLight.requestContainer();
	const core_group = container.coreContent();
	const object = core_group?.objects()[0] as PointLight;
	assert.deepEqual(object.color.toArray(), [1, 1, 1]);
});

QUnit.test('pointLight with transform', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const pointLight = geo1.createNode('pointLight');
	const transform = geo1.createNode('transform');

	transform.setInput(0, pointLight);
	transform.p.applyOn.set(TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.OBJECTS));
	transform.p.t.set([1, 2, 3]);

	let container = await transform.requestContainer();
	const core_group = container.coreContent();
	const object = core_group?.objects()[0] as PointLight;
	assert.deepEqual(object.color.toArray(), [1, 1, 1]);
	assert.deepEqual(object.position.toArray(), [1, 2, 3]);
});

QUnit.test('pointLight with copy SOP', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const pointLight = geo1.createNode('pointLight');
	const plane = geo1.createNode('plane');
	const copy = geo1.createNode('copy');
	copy.setInput(0, pointLight);
	copy.setInput(1, plane);

	let container = await copy.requestContainer();
	const core_group = container.coreContent();
	const objects = core_group?.objects() as PointLight[];
	assert.equal(objects.length, 4);
	const object0 = objects[0];
	assert.deepEqual(object0.color.toArray(), [1, 1, 1]);
	assert.in_delta(object0.position.x, -0.5, 0.01);
	assert.in_delta(object0.position.y, 0, 0.01);
	assert.in_delta(object0.position.z, -0.5, 0.01);
});
