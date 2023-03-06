import {Object3D} from 'three';
import {PointLight} from 'three';
import {TRANSFORM_TARGET_TYPES, TransformTargetType} from '../../../../src/core/Transform';

QUnit.test('pointLight simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const pointLight = geo1.createNode('pointLight');

	let container = await pointLight.compute();
	const core_group = container.coreContent();
	const object = core_group?.threejsObjects()[0] as PointLight;
	assert.deepEqual(object.color.toArray(), [1, 1, 1]);
});

QUnit.test('pointLight with transform', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const pointLight = geo1.createNode('pointLight');
	const transform = geo1.createNode('transform');

	transform.setInput(0, pointLight);
	transform.p.applyOn.set(TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.OBJECT));
	transform.p.t.set([1, 2, 3]);

	let container = await transform.compute();
	const core_group = container.coreContent();
	const object = core_group?.threejsObjects()[0] as PointLight;
	assert.deepEqual(object.color.toArray(), [1, 1, 1]);
	assert.deepEqual(object.position.toArray(), [1, 2, 3]);
});

QUnit.test('pointLight with copy SOP', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const pointLight = geo1.createNode('pointLight');
	const plane = geo1.createNode('plane');
	const copy = geo1.createNode('copy');
	copy.setInput(0, pointLight);
	copy.setInput(1, plane);

	let container = await copy.compute();
	const core_group = container.coreContent();
	const objects = core_group?.threejsObjects() as PointLight[];
	assert.equal(objects.length, 4);
	const object0 = objects[0];
	assert.deepEqual(object0.color.toArray(), [1, 1, 1]);
	assert.in_delta(object0.position.x, -0.5, 0.01);
	assert.in_delta(object0.position.y, 0, 0.01);
	assert.in_delta(object0.position.z, -0.5, 0.01);
});

function objectsCount(object: Object3D, countStart: number = 0) {
	countStart += 1;
	for (let child of object.children) {
		countStart += objectsCount(child);
	}
	return countStart;
}
function objectNames(object: Object3D, names: string[] = []) {
	names.push(object.name);
	for (let child of object.children) {
		objectNames(child, names);
	}
	return names;
}

QUnit.test('sop/pointLight hierarchy is maintained as it is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const pointLight1 = geo1.createNode('pointLight');
	const transform1 = geo1.createNode('transform');

	pointLight1.p.showHelper.set(true);
	transform1.setInput(0, pointLight1);

	let container = await pointLight1.compute();
	let coreGroup = container.coreContent();
	let object = coreGroup?.threejsObjects()[0]!;
	assert.equal(objectsCount(object), 3);
	assert.deepEqual(objectNames(object), [
		'PointLightGroup_pointLight1',
		'pointLight1',
		'PointLightHelper_pointLight1',
	]);

	container = await transform1.compute();
	coreGroup = container.coreContent();
	object = coreGroup?.threejsObjects()[0]!;
	assert.equal(objectsCount(object), 3);
	assert.deepEqual(objectNames(object), [
		'PointLightGroup_pointLight1',
		'pointLight1',
		'PointLightHelper_pointLight1',
	]);
});
