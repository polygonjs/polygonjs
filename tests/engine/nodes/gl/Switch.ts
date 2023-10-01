import type {QUnit} from '../../../helpers/QUnit';
import {ForLoopGlNode} from '../../../../src/engine/nodes/gl/ForLoop';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';
export function create_required_nodes_for_forLoop_gl_node(node: ForLoopGlNode) {
	const subnetOutput1 = node.createNode('subnetOutput');
	const subnetInput1 = node.createNode('subnetInput');
	return {subnetInput1, subnetOutput1};
}
export function testenginenodesglSwitch(qUnit: QUnit) {
	qUnit.test('gl switch can be saved and loaded and has the same number of inputs', async (assert) => {
		const MAT = window.MAT;
		const scene = window.scene;
		const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
		material_basic_builder1.createNode('output');
		const globals1 = material_basic_builder1.createNode('globals');
		assert.equal(material_basic_builder1.children().length, 2);

		material_basic_builder1.createNode('constant');
		const switch1 = material_basic_builder1.createNode('switch');
		assert.equal(switch1.io.inputs.namedInputConnectionPoints()!.length, 3, '3 inputs to start');

		switch1.setInput(1, globals1, 'position');
		assert.equal(switch1.io.inputs.namedInputConnectionPoints()!.length, 3, 'still 3');
		switch1.setInput(2, globals1, 'position');
		assert.equal(switch1.io.inputs.namedInputConnectionPoints()!.length, 4, 'now 4');

		await saveAndLoadScene(scene, async (scene2) => {
			const switch2 = scene2.node(switch1.path()) as ForLoopGlNode;
			assert.equal(switch2.io.inputs.maxInputsCount(), 4, 'still 4 after save/load');

			await saveAndLoadScene(scene2, async (scene2) => {
				const switch3 = scene2.node(switch2.path()) as ForLoopGlNode;
				assert.equal(switch3.io.inputs.maxInputsCount(), 4, 'still 4 after a 2nd save/load');

				switch3.setInput(1, null);
				assert.equal(switch3.io.inputs.maxInputsCount(), 4, 'we still have 4 after removing first input');
				switch3.setInput(2, null);
				assert.equal(switch3.io.inputs.maxInputsCount(), 3, 'and now back to 3');
			});
		});
	});
}
