import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SDFGradientGlNode} from '../../../../src/engine/nodes/gl/SDFGradient';

import DEFAULT_FRAGMENT from './SDFGradient/default.frag.glsl';
import NO_INPUT_EMPTY_VERTEX from './SDFGradient/noInput.vert.glsl';
import NO_INPUT_BASIC_VERTEX from './SDFGradient/noInputBasic.vert.glsl';
import INPUT_POS_BASIC_VERTEX from './SDFGradient/inputPosBasic.vert.glsl';
import TWO_INPUTS_BASIC_VERTEX from './SDFGradient/twoInputsBasic.vert.glsl';
import ALPHA_FRAGMENT from './SDFGradient/alpha.frag.glsl';

export function createRequiredNodesForSDFGradientGlNode(node: SDFGradientGlNode) {
	const subnetOutput1 = node.createNode('subnetOutput');
	const subnetInput1 = node.createNode('subnetInput');
	return {subnetInput1, subnetOutput1};
}

QUnit.test('gl SDFGradient simple', async (assert) => {
	const MAT = window.MAT;
	const materialBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const material = materialBasicBuilder1.material;
	const output1 = materialBasicBuilder1.createNode('output');
	const globals1 = materialBasicBuilder1.createNode('globals');
	assert.equal(materialBasicBuilder1.children().length, 2);

	materialBasicBuilder1.createNode('constant');
	const SDFGradient1 = materialBasicBuilder1.createNode('SDFGradient');
	SDFGradient1.p.inputsCount.set(0);
	const {subnetInput1, subnetOutput1} = createRequiredNodesForSDFGradientGlNode(SDFGradient1);
	assert.equal(SDFGradient1.io.outputs.namedOutputConnectionPoints().length, 2);
	assert.equal(SDFGradient1.io.inputs.namedInputConnectionPoints().length, 1);

	output1.setInput(0, SDFGradient1, 'gradient');

	assert.ok(materialBasicBuilder1.assemblerController?.compileRequired(), 'compiled is required');
	await materialBasicBuilder1.compute();
	assert.notOk(materialBasicBuilder1.assemblerController?.compileRequired(), 'compiled is required');
	assert.equal(material.vertexShader, NO_INPUT_EMPTY_VERTEX, 'no input empty vertex');
	assert.equal(material.fragmentShader, DEFAULT_FRAGMENT, 'default fragment');

	const SDFSphere1 = SDFGradient1.createNode('SDFSphere');
	SDFSphere1.setInput(0, subnetInput1);
	subnetOutput1.setInput(0, SDFSphere1);
	await materialBasicBuilder1.compute();
	assert.equal(material.vertexShader, NO_INPUT_BASIC_VERTEX, 'no input basic vertex');

	SDFGradient1.setInput(0, globals1, 'position');
	await materialBasicBuilder1.compute();
	assert.equal(material.vertexShader, INPUT_POS_BASIC_VERTEX, 'input pos basic vertex');

	SDFGradient1.p.inputsCount.set(1);
	SDFGradient1.setInputType(0, GlConnectionPointType.VEC2);
	SDFGradient1.setInput(1, globals1, 'uv');
	const vec2ToVec3_1 = SDFGradient1.createNode('vec2ToVec3');
	vec2ToVec3_1.setInput(0, subnetInput1, 1);
	const add1 = SDFGradient1.createNode('add');
	add1.setInput(0, subnetInput1, 0);
	add1.setInput(1, vec2ToVec3_1);
	SDFSphere1.setInput(0, add1);
	await materialBasicBuilder1.compute();
	assert.equal(material.vertexShader, TWO_INPUTS_BASIC_VERTEX, 'two inputs basic vertex');

	output1.setInput('alpha', SDFGradient1, 'sdf');
	await materialBasicBuilder1.compute();
	assert.equal(material.fragmentShader, ALPHA_FRAGMENT, 'alpha fragment');
});
