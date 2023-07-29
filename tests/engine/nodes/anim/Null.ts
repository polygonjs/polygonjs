import type {QUnit} from '../../../helpers/QUnit';
import {AnimTargetNodeTargetType} from '../../../../src/engine/nodes/anim/Target';
import {AnimPropertyValueNodeMode} from '../../../../src/engine/nodes/anim/PropertyValue';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AnimatedPropertiesRegister} from '../../../../src/core/animation/AnimatedPropertiesRegister';
export function testenginenodesanimNull(qUnit: QUnit) {

qUnit.test('anim null simple', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const box = geo.createNode('box');
	const objectProperties = geo.createNode('objectProperties');
	objectProperties.setInput(0, box);
	objectProperties.p.tname.set(true);
	objectProperties.p.name.set('test');
	objectProperties.flags.display.set(true);

	// we wait to ensure that the created objects
	// are attached to the scene.
	// otherwise the anim nodes will not find them.
	await CoreSleep.sleep(100);

	const object = (await objectProperties.compute()).coreContent()?.threejsObjects()[0]!;
	assert.equal(object.name, 'test');

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.SCENE_GRAPH);
	target.p.objectMask.set('*test');
	target.p.updateMatrix.set(true);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('position');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(3);
	propertyValue.p.value3.set([3, 4, 7]);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.deepEqual(object.position.toArray(), [0, 0, 0]);
	await null1.play();
	assert.deepEqual(object.position.toArray(), [3, 4, 7]);
});

qUnit.test('anim null object property vector3 element', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const box = geo.createNode('box');
	const objectProperties = geo.createNode('objectProperties');
	objectProperties.setInput(0, box);
	objectProperties.p.tname.set(true);
	objectProperties.p.name.set('test');
	objectProperties.flags.display.set(true);

	// we wait to ensure that the created objects
	// are attached to the scene.
	// otherwise the anim nodes will not find them.
	await CoreSleep.sleep(100);

	const object = (await objectProperties.compute()).coreContent()?.threejsObjects()[0]!;
	assert.equal(object.name, 'test');

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.SCENE_GRAPH);
	target.p.objectMask.set('*test');
	target.p.updateMatrix.set(true);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('position.y');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(1);
	propertyValue.p.value1.set(4);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.deepEqual(object.position.toArray(), [0, 0, 0]);
	await null1.play();
	assert.deepEqual(object.position.toArray(), [0, 4, 0]);
});

qUnit.test('anim null object property euler', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const box = geo.createNode('box');
	const objectProperties = geo.createNode('objectProperties');
	objectProperties.setInput(0, box);
	objectProperties.p.tname.set(true);
	objectProperties.p.name.set('test');
	objectProperties.flags.display.set(true);

	// we wait to ensure that the created objects
	// are attached to the scene.
	// otherwise the anim nodes will not find them.
	await CoreSleep.sleep(100);

	const object = (await objectProperties.compute()).coreContent()?.threejsObjects()[0]!;
	assert.equal(object.name, 'test');

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.SCENE_GRAPH);
	target.p.objectMask.set('*test');
	target.p.updateMatrix.set(true);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('rotation');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(3);
	propertyValue.p.value3.set([0, 1, 0]);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.deepEqual(object.rotation.toArray(), [0, 0, 0, 'XYZ']);
	await null1.play();
	assert.deepEqual(object.rotation.toArray(), [0, 1, 0, 'XYZ']);
});

qUnit.test('anim null object property euler component', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const box = geo.createNode('box');
	const objectProperties = geo.createNode('objectProperties');
	objectProperties.setInput(0, box);
	objectProperties.p.tname.set(true);
	objectProperties.p.name.set('test');
	objectProperties.flags.display.set(true);

	// we wait to ensure that the created objects
	// are attached to the scene.
	// otherwise the anim nodes will not find them.
	await CoreSleep.sleep(100);

	const object = (await objectProperties.compute()).coreContent()?.threejsObjects()[0]!;
	assert.equal(object.name, 'test');

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.SCENE_GRAPH);
	target.p.objectMask.set('*test');
	target.p.updateMatrix.set(true);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('rotation.y');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(1);
	propertyValue.p.value1.set(1);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.deepEqual(object.rotation.toArray(), [0, 0, 0, 'XYZ']);
	await null1.play();
	assert.deepEqual(object.rotation.toArray(), [0, 1, 0, 'XYZ']);
});

qUnit.test('anim null node integer param', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const line = geo.createNode('line');

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.NODE);
	target.p.nodePath.setNode(line);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('pointsCount');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(1);
	propertyValue.p.value1.set(7);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.equal(line.pv.pointsCount, 2);
	await null1.play();
	assert.equal(line.pv.pointsCount, 7);
});

qUnit.test('anim null node float param', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const box = geo.createNode('box');
	const transform = geo.createNode('transform');
	transform.setInput(0, box);

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.NODE);
	target.p.nodePath.setNode(transform);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('scale');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(1);
	propertyValue.p.value1.set(7);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.equal(transform.pv.scale, 1);
	await null1.play();
	assert.equal(transform.pv.scale, 7);
});

qUnit.test('anim null node vector2 param', async (assert) => {
	// setup objects
	const scene = window.scene;
	const COP = scene.createNode('copNetwork');
	const image = COP.createNode('image');

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.NODE);
	target.p.nodePath.setNode(image);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('center');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(2);
	propertyValue.p.value2.set([7, 5]);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.deepEqual(image.pv.center.toArray(), [0, 0]);
	await null1.play();
	assert.deepEqual(image.pv.center.toArray(), [7, 5]);
});

qUnit.test('anim null node vector3 param', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const box = geo.createNode('box');
	const transform = geo.createNode('transform');
	transform.setInput(0, box);

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.NODE);
	target.p.nodePath.setNode(transform);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('t');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(3);
	propertyValue.p.value3.set([7, 5, 48]);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.deepEqual(transform.pv.t.toArray(), [0, 0, 0]);
	await null1.play();
	assert.deepEqual(transform.pv.t.toArray(), [7, 5, 48]);
});

qUnit.test('anim null node vector4 param', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const box = geo.createNode('box');
	const attribCreate = geo.createNode('attribCreate');
	attribCreate.setInput(0, box);

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.NODE);
	target.p.nodePath.setNode(attribCreate);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('value4');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(4);
	propertyValue.p.value4.set([7, 5, 48, 9]);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.deepEqual(attribCreate.pv.value4.toArray(), [0, 0, 0, 0]);
	await null1.play();
	assert.deepEqual(attribCreate.pv.value4.toArray(), [7, 5, 48, 9]);
});

qUnit.test('anim null node color param', async (assert) => {
	// setup objects
	const scene = window.scene;
	const MAT = scene.createNode('materialsNetwork');
	const meshBasic = MAT.createNode('meshBasic');

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.NODE);
	target.p.nodePath.setNode(meshBasic);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('color');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue.p.size.set(3);
	propertyValue.p.value3.set([0.7, 0.5, 0.8]);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.deepEqual(meshBasic.p.color.valuePreConversionSerialized(), [1, 1, 1]);
	await null1.play();
	assert.deepEqual(meshBasic.p.color.valuePreConversionSerialized(), [0.7, 0.5, 0.8]);
});

qUnit.test('anim null play promise still returns if no target params resolved', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const box = geo.createNode('box');
	const attribCreate = geo.createNode('attribCreate');
	attribCreate.setInput(0, box);

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.NODE);
	target.p.nodePath.setNode(attribCreate);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('value4');

	const propertyValue = ANIM.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.setMode(AnimPropertyValueNodeMode.CUSTOM);
	// By setting a size of 3
	// but a propertyName of value4 on the attribCreate
	// the timelineBuilder will not find any matching param.
	// But the promise below should still resolve
	// for this test to complete successfully
	propertyValue.p.size.set(3);
	propertyValue.p.value4.set([7, 5, 48, 9]);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue);

	assert.deepEqual(attribCreate.pv.value4.toArray(), [0, 0, 0, 0]);
	await null1.play();
	assert.deepEqual(attribCreate.pv.value4.toArray(), [0, 0, 0, 0]);
});

/*
TESTS WITH AnimatedPropertiesRegister
*/
qUnit.test('animating a scene graph prop when it is already animated kills the previous timeline', async (assert) => {
	// setup objects
	const geo = window.geo1;
	const box = geo.createNode('box');
	const objectProperties = geo.createNode('objectProperties');
	objectProperties.setInput(0, box);
	objectProperties.p.tname.set(true);
	objectProperties.p.name.set('test');
	objectProperties.flags.display.set(true);

	// we wait to ensure that the created objects
	// are attached to the scene.
	// otherwise the anim nodes will not find them.
	await CoreSleep.sleep(100);

	const object = (await objectProperties.compute()).coreContent()?.threejsObjects()[0]!;
	assert.equal(object.name, 'test');

	// setup anim
	const ANIM = window.scene.root().createNode('animationsNetwork');
	const duration = ANIM.createNode('duration');
	duration.p.duration.set(4);

	const target = ANIM.createNode('target');
	target.setInput(0, duration);
	target.setTargetType(AnimTargetNodeTargetType.SCENE_GRAPH);
	target.p.objectMask.set('*test');
	target.p.updateMatrix.set(true);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('position');

	// null1
	const propertyValue1 = ANIM.createNode('propertyValue');
	propertyValue1.setInput(0, propertyName);
	propertyValue1.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue1.p.size.set(3);
	propertyValue1.p.value3.set([3, 4, 7]);
	const null1 = ANIM.createNode('null');
	null1.setInput(0, propertyValue1);

	// null2
	const propertyValue2 = ANIM.createNode('propertyValue');
	propertyValue2.setInput(0, propertyName);
	propertyValue2.setMode(AnimPropertyValueNodeMode.CUSTOM);
	propertyValue2.p.size.set(3);
	propertyValue2.p.value3.set([0, 0, 0]);
	const null2 = ANIM.createNode('null');
	null2.setInput(0, propertyValue2);

	// test with null1.p.stoppable.set(1)
	null1.p.stoppable.set(1);
	assert.in_delta(object.position.y, 0, 0.1);
	assert.equal(AnimatedPropertiesRegister.registeredPropertiesCount(), 0);
	null1.play();
	await CoreSleep.sleep(500);
	assert.in_delta(object.position.y, 0.5, 0.1);
	await CoreSleep.sleep(500);
	assert.in_delta(object.position.y, 1, 0.1);

	assert.equal(AnimatedPropertiesRegister.registeredPropertiesCount(), 1);
	null2.play();
	await CoreSleep.sleep(500);
	assert.equal(AnimatedPropertiesRegister.registeredPropertiesCount(), 1);
	await CoreSleep.sleep(500);
	assert.in_delta(object.position.y, 0.75, 0.1);
	await CoreSleep.sleep(4000);
	assert.in_delta(object.position.y, 0, 0.1);
	assert.equal(AnimatedPropertiesRegister.registeredPropertiesCount(), 0);

	await CoreSleep.sleep(1000);
	// test with null1.p.stoppable.set(0)
	null1.p.stoppable.set(0);
	assert.in_delta(object.position.y, 0, 0.1);
	assert.equal(AnimatedPropertiesRegister.registeredPropertiesCount(), 0);
	null1.play();
	await CoreSleep.sleep(500);
	assert.in_delta(object.position.y, 0.5, 0.1);
	await CoreSleep.sleep(500);
	assert.in_delta(object.position.y, 1, 0.1);

	assert.equal(AnimatedPropertiesRegister.registeredPropertiesCount(), 1);
	null2.play();
	await CoreSleep.sleep(500);
	assert.equal(AnimatedPropertiesRegister.registeredPropertiesCount(), 1);
	await CoreSleep.sleep(500);
	assert.in_delta(object.position.y, 2, 0.1);
	await CoreSleep.sleep(4000);
	assert.in_delta(object.position.y, 4, 0.1);
	assert.equal(AnimatedPropertiesRegister.registeredPropertiesCount(), 0);
});

}