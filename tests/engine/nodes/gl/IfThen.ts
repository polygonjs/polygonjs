import {IfThenGlNode} from '../../../../src/engine/nodes/gl/IfThen';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';

export function create_required_nodes_for_ifThen_gl_node(node: IfThenGlNode) {
	const subnetOutput1 = node.createNode('subnetOutput');
	const subnetInput1 = node.createNode('subnetInput');
	return {subnetInput1, subnetOutput1};
}

QUnit.test('gl ifThen has child subnetOutput disconnect if its own input is', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const constantCondition = material_basic_builder1.createNode('constant');
	constantCondition.setGlType(GlConnectionPointType.BOOL);

	// const constant1 = material_basic_builder1.createNode('constant');
	const ifThen1 = material_basic_builder1.createNode('ifThen');
	const {subnetInput1, subnetOutput1} = create_required_nodes_for_ifThen_gl_node(ifThen1);
	assert.equal(ifThen1.io.outputs.namedOutputConnectionPoints().length, 1);

	assert.equal(ifThen1.children().length, 2);
	assert.equal(
		subnetInput1.io.outputs.namedOutputConnectionPoints().length,
		1,
		'inputs count has not yet been updated'
	);
	assert.equal(subnetOutput1.io.inputs.namedInputConnectionPoints().length, 1);

	// the subnetInput does not update its input if we only connect to input 1, and not yet to 0
	// ifThen1.setInput(1, constant1);
	// ifThen1.p.inputsCount.set(1)
	assert.equal(subnetInput1.io.outputs.namedOutputConnectionPoints().length, 1, '2 inputs max only');
	assert.equal(subnetOutput1.io.inputs.namedInputConnectionPoints().length, 1);
	assert.equal(ifThen1.io.inputs.namedInputConnectionPoints().length, 2);
	assert.equal(ifThen1.io.outputs.namedOutputConnectionPoints().length, 1);

	// but when we add an input 0, the number of inputs updates
	// ifThen1.setInput(0, constantCondition);
	ifThen1.p.inputsCount.set(2);
	// ifThen1.p.outputsCount.set(2);
	assert.equal(subnetInput1.io.outputs.namedOutputConnectionPoints().length, 2, '2 inputs max only');
	assert.equal(subnetOutput1.io.inputs.namedInputConnectionPoints().length, 2);
	assert.equal(ifThen1.io.inputs.namedInputConnectionPoints().length, 3);
	assert.equal(ifThen1.io.outputs.namedOutputConnectionPoints().length, 2);

	// the if has an output connection point if we connect the subnetOutput
	ifThen1.p.inputsCount.set(3);
	// ifThen1.p.outputsCount.set(3);
	assert.equal(
		subnetInput1.io.outputs.namedOutputConnectionPoints().length,
		3,
		'set inputsCount and outputsCount to 3'
	);
	assert.equal(subnetOutput1.io.inputs.namedInputConnectionPoints().length, 3);
	assert.equal(ifThen1.io.inputs.namedInputConnectionPoints().length, 4);
	assert.equal(ifThen1.io.outputs.namedOutputConnectionPoints().length, 3);

	// and if we disconnect the ifThen inputs, they all update
	// ifThen1.setInput(1, null);
	ifThen1.p.inputsCount.set(1);
	// ifThen1.p.outputsCount.set(1);
	assert.equal(subnetInput1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(subnetOutput1.io.inputs.namedInputConnectionPoints().length, 1);
	assert.equal(ifThen1.io.inputs.namedInputConnectionPoints().length, 2);
	assert.equal(ifThen1.io.outputs.namedOutputConnectionPoints().length, 1);
});

QUnit.test('gl IfThen can be saved and loaded and has the same number of inputs', async (assert) => {
	const MAT = window.MAT;
	const scene = window.scene;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	const globals1 = material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	material_basic_builder1.createNode('constant');
	const ifThen1 = material_basic_builder1.createNode('ifThen');
	create_required_nodes_for_ifThen_gl_node(ifThen1);
	assert.equal(ifThen1.io.outputs.namedOutputConnectionPoints().length, 1);

	const constant1 = material_basic_builder1.createNode('constant');
	constant1.setGlType(GlConnectionPointType.BOOL);

	assert.equal(ifThen1.io.inputs.maxInputsCount(), 2);
	ifThen1.p.inputsCount.set(2);
	ifThen1.setInputType(1, GlConnectionPointType.VEC3);
	ifThen1.setInputName(1, 'position');
	ifThen1.setInput(1, globals1, 'position');
	assert.equal(ifThen1.io.inputs.maxInputsCount(), 3);

	ifThen1.setInputType(0, GlConnectionPointType.BOOL);
	ifThen1.setInputName(0, 'test');
	ifThen1.setInput(0, constant1);
	assert.equal(ifThen1.io.inputs.maxInputsCount(), 3);

	ifThen1.p.inputsCount.set(3);
	ifThen1.setInputType(2, GlConnectionPointType.VEC2);
	ifThen1.setInputName(2, 'uv');
	ifThen1.setInput(2, globals1, 'uv');
	assert.equal(ifThen1.io.inputs.maxInputsCount(), 4);

	await saveAndLoadScene(scene, async (scene2) => {
		const ifThen2 = scene2.node(ifThen1.path()) as IfThenGlNode;
		assert.equal(ifThen2.io.inputs.maxInputsCount(), 4);
		await saveAndLoadScene(scene, async (scene3) => {
			const ifThen3 = scene2.node(ifThen1.path()) as IfThenGlNode;
			assert.equal(ifThen3.io.inputs.maxInputsCount(), 4);
		});
	});
});
