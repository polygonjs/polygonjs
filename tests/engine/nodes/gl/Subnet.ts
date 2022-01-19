import {saveAndLoadScene} from '../../../helpers/ImportHelper';
import {SubnetGlNode} from '../../../../src/engine/nodes/gl/Subnet';

export function create_required_nodes_for_subnet_gl_node(node: SubnetGlNode) {
	const subnetOutput1 = node.createNode('subnetOutput');
	const subnetInput1 = node.createNode('subnetInput');
	return {subnetInput1, subnetOutput1};
}

QUnit.test('gl Subnet can be saved and loaded and has the same number of inputs', async (assert) => {
	const MAT = window.MAT;
	const scene = window.scene;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	const globals1 = material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	material_basic_builder1.createNode('constant');
	const subnet1 = material_basic_builder1.createNode('subnet');
	create_required_nodes_for_subnet_gl_node(subnet1);
	assert.equal(subnet1.io.outputs.namedOutputConnectionPoints().length, 1);

	assert.equal(subnet1.io.inputs.maxInputsCount(), 1);
	subnet1.setInput(0, globals1, 'position');
	assert.equal(subnet1.io.inputs.maxInputsCount(), 2);

	subnet1.setInput(1, globals1, 'uv');
	assert.equal(subnet1.io.inputs.maxInputsCount(), 3);

	await saveAndLoadScene(scene, async (scene2) => {
		const subnet2 = scene2.node(subnet1.path()) as SubnetGlNode;
		assert.equal(subnet2.io.inputs.maxInputsCount(), 3);
	});
});
