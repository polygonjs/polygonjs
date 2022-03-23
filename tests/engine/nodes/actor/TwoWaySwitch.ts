import {
	ActorConnectionPointType,
	BaseActorConnectionPoint,
} from '../../../../src/engine/nodes/utils/io/connections/Actor';

QUnit.test('actor/twoWaySwitch spare params are created as expected', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const twoWaySwitch1 = actor1.createNode('twoWaySwitch');
	const getMaterial1 = actor1.createNode('getMaterial');
	const constant1 = actor1.createNode('constant');

	twoWaySwitch1.setInput(1, getMaterial1);
	assert.deepEqual(
		twoWaySwitch1.io.inputs.namedInputConnectionPoints().map((cp: BaseActorConnectionPoint) => cp.type()),
		[ActorConnectionPointType.BOOLEAN, ActorConnectionPointType.MATERIAL, ActorConnectionPointType.MATERIAL]
	);

	twoWaySwitch1.setInput(1, null);
	constant1.setConstantType(ActorConnectionPointType.BOOLEAN);
	twoWaySwitch1.setInput(1, constant1);
	assert.deepEqual(
		twoWaySwitch1.io.inputs.namedInputConnectionPoints().map((cp: BaseActorConnectionPoint) => cp.type()),
		[ActorConnectionPointType.BOOLEAN, ActorConnectionPointType.BOOLEAN, ActorConnectionPointType.BOOLEAN]
	);

	twoWaySwitch1.setInput(1, null);
	constant1.setConstantType(ActorConnectionPointType.FLOAT);
	twoWaySwitch1.setInput(1, constant1);
	assert.deepEqual(
		twoWaySwitch1.io.inputs.namedInputConnectionPoints().map((cp: BaseActorConnectionPoint) => cp.type()),
		[ActorConnectionPointType.BOOLEAN, ActorConnectionPointType.FLOAT, ActorConnectionPointType.FLOAT]
	);
});
