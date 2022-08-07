import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';

import BasicDefaultVertex from './templates/raymarching/default.vert.glsl';
import BasicDefaultFragment from './templates/raymarching/default.frag.glsl';
import BasicMinimalVertex from './templates/raymarching/minimal.vert.glsl';
import BasicMinimalFragment from './templates/raymarching/minimal.frag.glsl';
import BasicPositionVertex from './templates/raymarching/position.vert.glsl';
import BasicPositionFragment from './templates/raymarching/position.frag.glsl';
import {RAYMARCHING_UNIFORMS} from '../../../../src/engine/nodes/gl/gl/raymarching/uniforms';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {RayMarchingBuilderMatNode} from '../../../../src/engine/nodes/mat/RayMarchingBuilder';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {ShaderMaterialWithCustomMaterials} from '../../../../src/core/geometry/Material';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

const TEST_SHADER_LIB = {
	default: {vert: BasicDefaultVertex, frag: BasicDefaultFragment},
	minimal: {vert: BasicMinimalVertex, frag: BasicMinimalFragment},
	position: {vert: BasicPositionVertex, frag: BasicPositionFragment},
};

const ALL_UNIFORMS = [
	...Object.keys(RAYMARCHING_UNIFORMS),
	'alphaMap',
	'alphaTest',
	'ambientLightColor',
	'aoMap',
	'aoMapIntensity',
	'bumpMap',
	'bumpScale',
	'diffuse',
	'directionalLightShadows',
	'directionalLights',
	'directionalShadowMap',
	'directionalShadowMatrix',
	'displacementBias',
	'displacementMap',
	'displacementScale',
	'emissive',
	'emissiveMap',
	'envMap',
	'envMapIntensity',
	'flipEnvMap',
	'fogColor',
	'fogDensity',
	'fogFar',
	'fogNear',
	'hemisphereLights',
	'ior',
	'lightMap',
	'lightMapIntensity',
	'lightProbe',
	'ltc_1',
	'ltc_2',
	'map',
	'metalness',
	'metalnessMap',
	'normalMap',
	'normalScale',
	'opacity',
	'pointLightShadows',
	'pointLights',
	'pointShadowMap',
	'pointShadowMatrix',
	'rectAreaLights',
	'reflectivity',
	'refractionRatio',
	'roughness',
	'roughnessMap',
	'spotLightShadows',
	'spotLights',
	'spotShadowMap',
	'spotShadowMatrix',
	'uv2Transform',
	'uvTransform',
	'v_POLY_texture_envTexture1',
];

export function onCreateHook(node: RayMarchingBuilderMatNode) {
	const globals = node.createNode('globals');
	const output = node.createNode('output');

	const sdfContext = node.createNode('SDFContext');
	const sdfMaterial = node.createNode('SDFMaterial');
	const sdfSphere = node.createNode('SDFSphere');
	const constant = node.createNode('constant');

	output.setInput(0, sdfContext);
	sdfContext.setInput(0, sdfSphere);
	sdfContext.setInput(1, sdfMaterial);
	sdfSphere.setInput('position', globals, 'position');
	sdfMaterial.setInput('color', constant);

	constant.setGlType(GlConnectionPointType.VEC3);
	constant.p.asColor.set(1);
	constant.p.color.set([1, 1, 1]);

	globals.uiData.setPosition(-300, -0);
	output.uiData.setPosition(300, 0);

	sdfContext.uiData.setPosition(100, 0);
	sdfSphere.uiData.setPosition(-100, 0);
	sdfMaterial.uiData.setPosition(-100, 200);
	constant.uiData.setPosition(-300, 200);

	return {globals, output, sdfSphere, sdfMaterial};
}

QUnit.test('mat/rayMarchingBuilder simple', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	// const debug = MAT.createNode('test')
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const {globals, sdfSphere} = onCreateHook(rayMarchingBuilder1);
	const material = rayMarchingBuilder1.material as ShaderMaterialWithCustomMaterials;

	await RendererUtils.compile(rayMarchingBuilder1, renderer);
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.default.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.default.frag));
	assert.deepEqual(Object.keys(MaterialUserDataUniforms.getUniforms(material)!).sort(), ALL_UNIFORMS.sort());

	sdfSphere.setInput('radius', globals, 'time');
	await RendererUtils.compile(rayMarchingBuilder1, renderer);
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.minimal.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.minimal.frag));

	const floatToVec31 = rayMarchingBuilder1.createNode('floatToVec3');
	floatToVec31.setInput(0, globals, 'time');
	await RendererUtils.compile(rayMarchingBuilder1, renderer);
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.position.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.position.frag));

	RendererUtils.dispose();
});

QUnit.test('mat/rayMarchingBuilder persisted_config', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const {sdfSphere, sdfMaterial} = onCreateHook(rayMarchingBuilder1);
	const param1 = rayMarchingBuilder1.createNode('param');
	param1.setGlType(GlConnectionPointType.FLOAT);
	param1.p.name.set('float_param');
	const param2 = rayMarchingBuilder1.createNode('param');
	param2.setGlType(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');

	sdfSphere.setInput('radius', param1);
	sdfMaterial.setInput('color', param2);

	await RendererUtils.compile(rayMarchingBuilder1, renderer);
	const rayMarching1Material = rayMarchingBuilder1.material as ShaderMaterialWithCustomMaterials;

	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(rayMarchingBuilder1.usedAssembler(), async () => {
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const rayMarchingBuilder2 = scene2.node(rayMarchingBuilder1.path()) as RayMarchingBuilderMatNode;
		assert.notOk(rayMarchingBuilder2.assemblerController());
		assert.ok(rayMarchingBuilder2.persisted_config);
		const float_param = rayMarchingBuilder2.params.get('float_param') as FloatParam;
		const vec3_param = rayMarchingBuilder2.params.get('vec3_param') as Vector3Param;
		assert.ok(float_param);
		assert.ok(vec3_param);
		const material = rayMarchingBuilder2.material as ShaderMaterialWithCustomMaterials;
		await RendererUtils.compile(rayMarchingBuilder2, renderer);
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(rayMarching1Material.fragmentShader)
		);
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(rayMarching1Material.vertexShader)
		);

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
