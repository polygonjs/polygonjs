import type {QUnit} from '../../../helpers/QUnit';
import {MeshDepthBuilderMatNode} from './../../../../src/engine/nodes/mat/MeshDepthBuilder';
import {SceneJsonImporter} from './../../../../src/engine/io/json/import/Scene';
import {AssemblersUtils} from './../../../helpers/AssemblersUtils';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {RendererUtils} from './../../../helpers/RendererUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';
export function testenginenodesmatMeshDepthMaterial(qUnit: QUnit) {
qUnit.test('meshDepthMaterial as a custom mat is saved and loaded with the correct depth packing', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const meshDepthBuilder1 = MAT.createNode('meshDepthBuilder');
	const output1 = meshDepthBuilder1.createNode('output');
	const globals1 = meshDepthBuilder1.createNode('globals');
	const vec3ToFloat1 = meshDepthBuilder1.createNode('vec3ToFloat');

	vec3ToFloat1.setInput(0, globals1, 'position');
	output1.setInput('alpha', vec3ToFloat1, 'y');
	await RendererUtils.compile(meshDepthBuilder1, renderer);
	const meshDepthMaterial = await meshDepthBuilder1.material();

	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(meshDepthBuilder1.usedAssembler(), async () => {
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const newMeshDepthBuilder2 = scene2.node(meshDepthBuilder1.path()) as MeshDepthBuilderMatNode;
		assert.notOk(newMeshDepthBuilder2.assemblerController());
		assert.ok(newMeshDepthBuilder2.persisted_config);

		const material = await newMeshDepthBuilder2.material();
		await RendererUtils.compile(newMeshDepthBuilder2, renderer);

		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(meshDepthMaterial.fragmentShader)
		);
		assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(meshDepthMaterial.vertexShader));

		assert.equal(material.depthPacking, meshDepthMaterial.depthPacking);
	});

	RendererUtils.dispose();
});

}