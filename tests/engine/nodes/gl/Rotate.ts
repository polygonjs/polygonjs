import type {QUnit} from '../../../helpers/QUnit';
import {GlRotateMode} from '../../../../src/engine/nodes/gl/Rotate';
import {ParamType} from '../../../../src/engine/poly/ParamType';
export function testenginenodesglRotate(qUnit: QUnit) {

qUnit.test('gl rotate has his input updated when mode changes', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const constant1 = material_basic_builder1.createNode('constant');
	const rotate1 = material_basic_builder1.createNode('rotate');

	rotate1.set_signature(GlRotateMode.AXIS);
	assert.equal(rotate1.io.inputs.namedInputConnectionPoints().length, 3);
	rotate1.set_signature(GlRotateMode.QUAT);
	assert.equal(rotate1.io.inputs.namedInputConnectionPoints().length, 2);

	rotate1.set_signature(GlRotateMode.AXIS);
	assert.equal(rotate1.io.inputs.namedInputConnectionPoints().length, 3);

	rotate1.setInput(2, constant1);
	assert.ok(rotate1.io.inputs.input(2));
	assert.equal(rotate1.io.inputs.input(2)?.graphNodeId(), constant1.graphNodeId());

	// check that the input is removed
	rotate1.set_signature(GlRotateMode.QUAT);
	assert.notOk(rotate1.io.inputs.input(2));
});

qUnit.test('gl rotate is created with correct defaults', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const rotate1 = material_basic_builder1.createNode('rotate');
	assert.deepEqual(rotate1.params.paramWithType('vector', ParamType.VECTOR3)!.valueSerialized(), [0, 0, 1]);
	assert.deepEqual(rotate1.params.paramWithType('axis', ParamType.VECTOR3)!.valueSerialized(), [0, 1, 0]);
});

}