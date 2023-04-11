import {JsConnectionPointType, BaseJsConnectionPoint} from '../../../../src/engine/nodes/utils/io/connections/Js';

QUnit.test('js/twoWaySwitch spare params are created as expected', async (assert) => {
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
		twoWaySwitch1.io.inputs.namedInputConnectionPoints().map((cp: BaseJsConnectionPoint) => cp.type()),
		[JsConnectionPointType.BOOLEAN, JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL]
	);

	twoWaySwitch1.setInput(1, null);
	constant1.setJsType(JsConnectionPointType.BOOLEAN);
	twoWaySwitch1.setInput(1, constant1);
	assert.deepEqual(
		twoWaySwitch1.io.inputs.namedInputConnectionPoints().map((cp: BaseJsConnectionPoint) => cp.type()),
		[JsConnectionPointType.BOOLEAN, JsConnectionPointType.BOOLEAN, JsConnectionPointType.BOOLEAN]
	);

	twoWaySwitch1.setInput(1, null);
	constant1.setJsType(JsConnectionPointType.FLOAT);
	twoWaySwitch1.setInput(1, constant1);
	assert.deepEqual(
		twoWaySwitch1.io.inputs.namedInputConnectionPoints().map((cp: BaseJsConnectionPoint) => cp.type()),
		[JsConnectionPointType.BOOLEAN, JsConnectionPointType.FLOAT, JsConnectionPointType.FLOAT]
	);
});
