import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {create_required_nodes_for_subnet_gl_node} from './Subnet';
import {SubnetGlNode} from '../../../../src/engine/nodes/gl/Subnet';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';

QUnit.test('gl param updates its output type correctly when created', async (assert) => {
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	meshBasicBuilder1.createNode('globals');
	assert.equal(meshBasicBuilder1.children().length, 2);

	const param1 = meshBasicBuilder1.createNode('param');

	assert.equal(param1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints()[0].type(), GlConnectionPointType.FLOAT);

	param1.p.type.set(param1.pv.type + 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
});

QUnit.test('gl param updates its output type correctly when scene is loaded', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	meshBasicBuilder1.createNode('globals');
	assert.equal(meshBasicBuilder1.children().length, 2);

	const param1 = meshBasicBuilder1.createNode('param');
	assert.equal(param1.pv.type, 2);
	param1.p.type.set(param1.pv.type + 1);
	assert.equal(param1.pv.type, 3);

	const data = await new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();

	const material_basic_builder2 = scene.node('/MAT/meshBasicBuilder1')!;
	assert.ok(material_basic_builder2);
	assert.equal(material_basic_builder2.children().length, 3, 'new mat has 3 children');
	const param2 = meshBasicBuilder1.node('param1')!;
	assert.ok(param2);
	assert.equal(param2.pv.type, 3);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
});

QUnit.test('gl param updates its parent material with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
	const param1 = meshBasicBuilder1.createNode('param');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.FLOAT);

	// change type
	param1.setGlType(GlConnectionPointType.VEC3);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 4);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.VECTOR3);
	param1.setGlType(GlConnectionPointType.VEC2);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 3);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.VECTOR2);
	param1.setGlType(GlConnectionPointType.VEC4);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 5);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.VECTOR4);
	param1.setGlType(GlConnectionPointType.BOOL);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.BOOLEAN);
	param1.setGlType(GlConnectionPointType.INT);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.INTEGER);

	// change name
	param1.p.name.set('customParam');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'customParam');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.INTEGER);

	// remove
	meshBasicBuilder1.removeNode(param1);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
});

QUnit.test('gl param updates its parent cop builder with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer(scene);
	assert.ok(renderer, 'renderer created');
	const COP = window.COP;
	const builder1 = COP.createNode('builder');
	builder1.createNode('output');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 0);
	const param1 = builder1.createNode('param');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.FLOAT);

	// change type
	param1.setGlType(GlConnectionPointType.VEC3);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 4);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.VECTOR3);
	param1.setGlType(GlConnectionPointType.VEC2);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 3);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.VECTOR2);
	param1.setGlType(GlConnectionPointType.VEC4);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 5);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.VECTOR4);
	param1.setGlType(GlConnectionPointType.BOOL);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.BOOLEAN);
	param1.setGlType(GlConnectionPointType.INT);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.INTEGER);

	// change name
	param1.p.name.set('customParam');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'customParam');
	assert.equal(builder1.params.spare[0].type(), ParamType.INTEGER);

	// remove
	builder1.removeNode(param1);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 0);
});

QUnit.test('gl param updates its particles system with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer(scene);
	assert.ok(renderer, 'renderer created');
	const geo1 = window.geo1;
	const particlesSystemGpu1 = geo1.createNode('particlesSystemGpu');
	const plane = geo1.createNode('plane');
	particlesSystemGpu1.setInput(0, plane);
	particlesSystemGpu1.createNode('output');
	particlesSystemGpu1.flags.display.set(true);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 0);
	const param1 = particlesSystemGpu1.createNode('param');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.FLOAT);

	// change type
	param1.setGlType(GlConnectionPointType.VEC3);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 4);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.VECTOR3);
	param1.setGlType(GlConnectionPointType.VEC2);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 3);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.VECTOR2);
	param1.setGlType(GlConnectionPointType.VEC4);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 5);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.VECTOR4);
	param1.setGlType(GlConnectionPointType.BOOL);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.BOOLEAN);
	param1.setGlType(GlConnectionPointType.INT);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.INTEGER);

	// change name
	param1.p.name.set('customParam');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'customParam');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.INTEGER);

	// remove
	particlesSystemGpu1.removeNode(param1);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 0);
});

QUnit.test('gl param: 1 param node on top level and one in a subnet work ok', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	meshBasicBuilder1.createNode('globals');
	const material = await meshBasicBuilder1.material();
	const output1 = meshBasicBuilder1.nodesByType('output')[0];
	meshBasicBuilder1.nodesByType('globals')[0];
	const subnet1 = meshBasicBuilder1.createNode('subnet');
	const {subnetOutput1} = create_required_nodes_for_subnet_gl_node(subnet1);
	// const subnet_subnetInput1 = subnetInput1;
	const subnet_subnetOutput1 = subnetOutput1;

	function createParamNode(parent: SubnetGlNode | MeshBasicBuilderMatNode) {
		const param1 = parent.createNode('param');
		param1.p.name.set('test');
		param1.setGlType(GlConnectionPointType.FLOAT);
		return param1;
	}

	// only 1 param in subnet
	const param1 = createParamNode(subnet1);
	const floatToVec3_1 = subnet1.createNode('vec3ToFloat');
	floatToVec3_1.setInput(0, param1);
	subnet_subnetOutput1.setInput(0, floatToVec3_1);
	subnet1.setInputType(0, GlConnectionPointType.VEC3);
	subnet1.setInputName(0, 'pos');
	output1.setInput('color', subnet1);

	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(meshBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is not required');
	let uniform = MaterialUserDataUniforms.getUniforms(material)!['v_POLY_param_test'];
	assert.ok(uniform);
	assert.equal(uniform.value, 0);
	let spareParam = meshBasicBuilder1.params.get('test')!;
	assert.ok(spareParam);
	spareParam.set(0.5);
	assert.equal(uniform.value, 0.5);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/param1
uniform float v_POLY_param_test;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/param1
		float v_POLY_subnet1_param1_val = v_POLY_param_test;
	
		// /MAT/meshBasicBuilder1/subnet1/vec3ToFloat1
		float v_POLY_subnet1_vec3ToFloat1_x = v_POLY_subnet1_param1_val.x;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_subnet1_pos;`
	);

	// only 1 param out of subnet
	subnet1.removeNode(param1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.not_includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/param1
uniform float v_POLY_param_test;`,
		'uniform is not declared anymore'
	);
	spareParam = meshBasicBuilder1.params.get('test')!;
	assert.notOk(spareParam, 'spare param is removed');

	const param2 = createParamNode(meshBasicBuilder1);
	const floatToVec3_2 = meshBasicBuilder1.createNode('vec3ToFloat');
	floatToVec3_2.setInput(0, param2);
	output1.setInput('color', floatToVec3_2);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(meshBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is not required');
	uniform = MaterialUserDataUniforms.getUniforms(material)!['v_POLY_param_test'];
	assert.ok(uniform, 'uniform exists');
	assert.equal(uniform.value, 0.5, 'uniform value is still previous one (0.5)');
	spareParam = meshBasicBuilder1.params.get('test')!;
	assert.ok(spareParam);
	spareParam.set(0.7);
	assert.equal(uniform.value, 0.7);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/param1
uniform float v_POLY_param_test;`
	);
	assert.not_includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/param1
	float v_POLY_param1_val = v_POLY_param_test;

	// /MAT/meshBasicBuilder1/vec3ToFloat1
	float v_POLY_vec3ToFloat1_x = v_POLY_param1_val.x;`,
		'assign param to a value first'
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_vec3ToFloat1_x;`
	);

	// and with both param nodes
	const param3 = createParamNode(subnet1);
	floatToVec3_1.setInput(0, param3);
	const add1 = meshBasicBuilder1.createNode('add');
	add1.setInput(0, subnet1);
	add1.setInput(1, floatToVec3_2);
	output1.setInput('color', add1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(meshBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is not required');
	uniform = MaterialUserDataUniforms.getUniforms(material)!['v_POLY_param_test'];
	assert.ok(uniform, 'uniform exists');
	assert.equal(uniform.value, 0.7, 'uniform value is still previous one (0.7)');
	spareParam = meshBasicBuilder1.params.get('test')!;
	assert.ok(spareParam);
	spareParam.set(0.8);
	assert.equal(uniform.value, 0.8);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/param1
uniform float v_POLY_param_test;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1
	vec3 v_POLY_subnet1_pos = vec3(0.0, 0.0, 0.0);
	if(true){
		// /MAT/meshBasicBuilder1/subnet1/param1
		float v_POLY_subnet1_param1_val = v_POLY_param_test;
	
		// /MAT/meshBasicBuilder1/subnet1/vec3ToFloat1
		float v_POLY_subnet1_vec3ToFloat1_x = v_POLY_subnet1_param1_val.x;
	
		// /MAT/meshBasicBuilder1/subnet1/subnetOutput1
		v_POLY_subnet1_pos = v_POLY_subnet1_vec3ToFloat1_x;
	}`,
		'assign param to a val first'
	);

	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_add1_sum;`
	);

	RendererUtils.dispose();
});
