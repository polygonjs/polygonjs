import {AnimTargetNodeTargetType} from '../../../../src/engine/nodes/anim/Target';
import {AnimPropertyValueNodeMode} from '../../../../src/engine/nodes/anim/PropertyValue';
import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('anim null simple', async (assert) => {
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

	const object = (await objectProperties.compute()).coreContent()?.objects()[0]!;
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
