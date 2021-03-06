import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {BaseBuilderMatNodeType} from '../../../../src/engine/nodes/mat/_BaseBuilder';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';

import BasicVertex from './templates/lineBasic/Basic.vert.glsl';
import BasicFragment from './templates/lineBasic/Basic.frag.glsl';
const TEST_SHADER_LIB = {
	basic: {vert: BasicVertex, frag: BasicFragment},
};

QUnit.test('lineBasic builder persisted_config', async (assert) => {
	const MAT = window.MAT;
	const lineBasicBuilder1 = MAT.createNode('lineBasicBuilder');
	lineBasicBuilder1.createNode('output');
	lineBasicBuilder1.createNode('globals');
	const output1 = lineBasicBuilder1.nodesByType('output')[0];
	const globals1 = lineBasicBuilder1.nodesByType('globals')[0];

	output1.setInput('color', globals1, 'position');
	await lineBasicBuilder1.compute();
	const mat1 = lineBasicBuilder1.material;

	assert.equal(mat1.vertexShader, TEST_SHADER_LIB.basic.vert);
	assert.equal(mat1.fragmentShader, TEST_SHADER_LIB.basic.frag);

	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(lineBasicBuilder1.usedAssembler(), async () => {
		console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const lineBasicBuilder2 = scene2.node(lineBasicBuilder1.path()) as BaseBuilderMatNodeType;
		const mat2 = lineBasicBuilder2.material;

		assert.equal(mat2.vertexShader, TEST_SHADER_LIB.basic.vert);
		assert.equal(mat2.fragmentShader, TEST_SHADER_LIB.basic.frag);
	});
});
