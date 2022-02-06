import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {PointsBuilderMatNode} from '../../../../src/engine/nodes/mat/PointsBuilder';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';

QUnit.test('points builder persisted_config', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer();
	const MAT = window.MAT;
	const points1 = MAT.createNode('pointsBuilder');
	points1.createNode('output');
	points1.createNode('globals');
	const output1 = points1.nodesByType('output')[0];
	const globals1 = points1.nodesByType('globals')[0];
	const param1 = points1.createNode('param');
	param1.p.name.set('float_param');
	const param2 = points1.createNode('param');
	param2.setGlType(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');
	const float_to_vec31 = points1.createNode('floatToVec3');
	float_to_vec31.setInput(0, param1);
	float_to_vec31.setInput(1, globals1, 'time');
	output1.setInput('color', float_to_vec31);
	output1.setInput('position', param2);
	await RendererUtils.compile(points1, renderer);
	const points1Material = points1.material;

	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(points1.usedAssembler(), async () => {
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const new_points1 = scene2.node('/MAT/pointsBuilder1') as PointsBuilderMatNode;
		assert.notOk(new_points1.assemblerController());
		assert.ok(new_points1.persisted_config);
		const float_param = new_points1.params.get('float_param') as FloatParam;
		const vec3_param = new_points1.params.get('vec3_param') as Vector3Param;
		assert.ok(float_param);
		assert.ok(vec3_param);
		const material = new_points1.material;
		await RendererUtils.compile(new_points1, renderer);
		assert.equal(material.fragmentShader, points1Material.fragmentShader);
		assert.equal(material.vertexShader, points1Material.vertexShader);

		// float param callback
		assert.equal(MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_float_param.value, 0);
		float_param.set(2);
		assert.equal(MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_float_param.value, 2);
		float_param.set(4);
		assert.equal(MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_float_param.value, 4);

		// vector3 param callback
		assert.deepEqual(
			MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_vec3_param.value.toArray(),
			[0, 0, 0]
		);
		vec3_param.set([1, 2, 3]);
		assert.deepEqual(
			MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_vec3_param.value.toArray(),
			[1, 2, 3]
		);
		vec3_param.set([5, 6, 7]);
		assert.deepEqual(
			MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_vec3_param.value.toArray(),
			[5, 6, 7]
		);
	});
	RendererUtils.dispose();
});
