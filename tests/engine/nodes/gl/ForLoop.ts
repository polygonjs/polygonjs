import {ForLoopGlNode} from '../../../../src/engine/nodes/gl/ForLoop';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';

export function create_required_nodes_for_forLoop_gl_node(node: ForLoopGlNode) {
	const subnetOutput1 = node.createNode('subnetOutput');
	const subnetInput1 = node.createNode('subnetInput');
	return {subnetInput1, subnetOutput1};
}

QUnit.test('gl ForLoop can be saved and loaded and has the same number of inputs', async (assert) => {
	const MAT = window.MAT;
	const scene = window.scene;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	const globals1 = material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	material_basic_builder1.createNode('constant');
	const forLoop1 = material_basic_builder1.createNode('forLoop');
	create_required_nodes_for_forLoop_gl_node(forLoop1);
	assert.equal(forLoop1.io.outputs.namedOutputConnectionPoints().length, 1);

	assert.equal(forLoop1.io.inputs.maxInputsCount(), 1);
	forLoop1.setInput(0, globals1, 'position');
	assert.equal(forLoop1.io.inputs.maxInputsCount(), 2);

	forLoop1.setInput(1, globals1, 'uv');
	assert.equal(forLoop1.io.inputs.maxInputsCount(), 3);

	await saveAndLoadScene(scene, async (scene2) => {
		const forLoop2 = scene2.node(forLoop1.path()) as ForLoopGlNode;
		assert.equal(forLoop2.io.inputs.maxInputsCount(), 3);
	});
});
