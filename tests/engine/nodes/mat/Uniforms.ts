import {CoreSleep} from '../../../../src/core/Sleep';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RampParam} from '../../../../src/engine/params/Ramp';
import {NodePathParam} from '../../../../src/engine/params/NodePath';
import {FloatParam} from '../../../../src/engine/params/Float';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {ImageCopNode} from '../../../../src/engine/nodes/cop/Image';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('MAT spare params: ensures uniforms are set when scene loads', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer();

	const scene = window.scene;
	const MAT = window.MAT;
	const COP = window.COP;
	const image1 = COP.createNode('image');
	const cop_file_name = 'file_uv';
	image1.setName(cop_file_name);
	const container = await image1.compute();
	const file1_texture = container.texture();
	await scene.waitForCooksCompleted();

	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];
	const float_to_vec31 = mesh_basic1.createNode('floatToVec3');
	const vec3ToFloat1 = mesh_basic1.createNode('vec3ToFloat');
	const vec4_to_float1 = mesh_basic1.createNode('vec4ToFloat');
	const param1 = mesh_basic1.createNode('param');
	const ramp1 = mesh_basic1.createNode('ramp');
	const texture1 = mesh_basic1.createNode('texture');
	// texture1.p.defaultValue.set(file1.path());

	output1.setInput('color', float_to_vec31);
	// ramp
	float_to_vec31.setInput(0, ramp1);
	ramp1.setInput(0, vec3ToFloat1);
	vec3ToFloat1.setInput(0, globals1, 'position');
	// texture
	float_to_vec31.setInput(1, vec4_to_float1, 0);
	vec4_to_float1.setInput(0, texture1);
	texture1.setInput(0, globals1, 'uv');
	// param
	float_to_vec31.setInput(2, param1, 0);

	await RendererUtils.compile(mesh_basic1, renderer);
	await CoreSleep.sleep(100);
	assert.equal(mesh_basic1.params.spare.length, 3);
	// const ramp_spare_param1 = mesh_basic1.params.get('ramp') as RampParam;
	const nodePathSpareParam1 = mesh_basic1.params.get('texture1') as NodePathParam;
	assert.equal(nodePathSpareParam1.value.path(), '');
	nodePathSpareParam1.setNode(image1);

	const float_spare_param1 = mesh_basic1.params.get('param1') as FloatParam;
	float_spare_param1.set(0.75);
	await CoreSleep.sleep(300); // delay should be longer than the delay in SpareParamsController for operator_path params

	// ramp_spare_param1 is no longer the same,
	// as it has been replaced
	// this assert does not seem to apply anymore
	// assert.notEqual(ramp_spare_param1.graphNodeId(), mesh_basic1.params.get('ramp')!.graphNodeId());

	// check that the spare params are present
	assert.ok(mesh_basic1.params.get('ramp1'));
	assert.ok(nodePathSpareParam1);
	assert.ok(float_spare_param1);
	// check that the spare paramsare the expected type
	assert.equal(mesh_basic1.params.get('ramp1')!.type(), ParamType.RAMP);
	assert.equal(nodePathSpareParam1.type(), ParamType.NODE_PATH);
	assert.equal(float_spare_param1.type(), ParamType.FLOAT);
	// check that the uniforms are present
	const mesh_basic1Material = mesh_basic1.material;
	assert.ok(MaterialUserDataUniforms.getUniforms(mesh_basic1Material)!['v_POLY_ramp_ramp1']);
	assert.ok(MaterialUserDataUniforms.getUniforms(mesh_basic1Material)!['v_POLY_texture_texture1']);
	assert.ok(MaterialUserDataUniforms.getUniforms(mesh_basic1Material)!['v_POLY_param_param1']);

	assert.equal(
		MaterialUserDataUniforms.getUniforms(mesh_basic1Material)!['v_POLY_ramp_ramp1'].value.uuid,
		(mesh_basic1.params.get('ramp1') as RampParam).rampTexture().uuid,
		'ramp1 uuid is expected'
	);
	assert.equal(
		MaterialUserDataUniforms.getUniforms(mesh_basic1Material)!['v_POLY_texture_texture1'].value.uuid,
		file1_texture.uuid,
		'uuid are equals'
	);
	assert.equal(
		MaterialUserDataUniforms.getUniforms(mesh_basic1Material)!['v_POLY_param_param1'].value,
		0.75,
		'param uniform is expected val'
	);

	// and now we save and reload

	const data = new SceneJsonExporter(scene).data();

	// the param is not saved in the export data, since it will be re-created

	// console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();
	await CoreSleep.sleep(500);

	const image2 = scene2.node(image1.path()) as ImageCopNode;
	const container2 = await image2.compute();
	const file2_texture = container2.texture();
	const mesh_basic2 = scene2.node(mesh_basic1.path()) as MeshBasicBuilderMatNode;
	assert.equal(mesh_basic2.params.spare.length, 3);
	const ramp_spare_param2 = mesh_basic2.params.get('ramp1') as RampParam;
	// const operator_path_spare_param2 = mesh_basic2.params.get('textureMap') as OperatorPathParam;
	// const float_spare_param2 = mesh_basic2.params.get('param1') as FloatParam;

	const mesh_basic2Material = mesh_basic2.material;
	await RendererUtils.compile(mesh_basic2, renderer);
	assert.equal(
		MaterialUserDataUniforms.getUniforms(mesh_basic2Material)!['v_POLY_ramp_ramp1'].value.uuid,
		ramp_spare_param2.rampTexture().uuid
	);
	assert.equal(
		MaterialUserDataUniforms.getUniforms(mesh_basic2Material)!['v_POLY_texture_texture1'].value.uuid,
		file2_texture.uuid
	);
	assert.equal(MaterialUserDataUniforms.getUniforms(mesh_basic2Material)!['v_POLY_param_param1'].value, 0.75);

	RendererUtils.dispose();
});
