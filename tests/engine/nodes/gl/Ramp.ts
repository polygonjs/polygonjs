import {SubnetGlNode} from '../../../../src/engine/nodes/gl/Subnet';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {RampParam} from '../../../../src/engine/params/Ramp';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {create_required_nodes_for_subnet_gl_node} from './Subnet';
import {RampValue, RampPoint, RampInterpolation} from '../../../../src/engine/params/ramp/RampValue';
import {DataTexture} from 'three/src/textures/DataTexture';
import {materialUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';

QUnit.test('gl ramp updates its parent material with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
	const ramp1 = meshBasicBuilder1.createNode('ramp');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'ramp1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.RAMP);

	// change name
	ramp1.p.name.set('customRamp');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'customRamp');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.RAMP);

	// remove
	meshBasicBuilder1.removeNode(ramp1);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
});

QUnit.test('gl ramp updates its parent cop builder with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');
	const COP = window.COP;
	const builder1 = COP.createNode('builder');
	builder1.createNode('output');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 0);
	const ramp1 = builder1.createNode('ramp');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'ramp1');
	assert.equal(builder1.params.spare[0].type(), ParamType.RAMP);

	// change name
	ramp1.p.name.set('customRamp');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'customRamp');
	assert.equal(builder1.params.spare[0].type(), ParamType.RAMP);

	// remove
	builder1.removeNode(ramp1);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 0);
});

QUnit.test('gl ramp updates its particles system with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');
	const geo1 = window.geo1;
	const particlesSystemGpu1 = geo1.createNode('particlesSystemGpu');
	const plane = geo1.createNode('plane');
	particlesSystemGpu1.setInput(0, plane);
	particlesSystemGpu1.createNode('output');
	particlesSystemGpu1.flags.display.set(true);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 0);
	const ramp1 = particlesSystemGpu1.createNode('ramp');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'ramp1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.RAMP);

	// change name
	ramp1.p.name.set('customRamp');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'customRamp');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.RAMP);

	// remove
	particlesSystemGpu1.removeNode(ramp1);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 0);
});

QUnit.test('gl ramp: 1 ramp node on top level and one in a subnet work ok', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer();
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	meshBasicBuilder1.createNode('globals');
	const material = meshBasicBuilder1.material;
	const output1 = meshBasicBuilder1.nodesByType('output')[0];
	meshBasicBuilder1.nodesByType('globals')[0];
	const subnet1 = meshBasicBuilder1.createNode('subnet');
	const {subnetOutput1} = create_required_nodes_for_subnet_gl_node(subnet1);
	// const subnet_subnetInput1 = subnetInput1;
	const subnet_subnetOutput1 = subnetOutput1;

	// init ramp values
	const rampValue1 = new RampValue(RampInterpolation.CUBIC, [new RampPoint(0, 0.25), new RampPoint(1, 0.4)]);
	const rampValue2 = new RampValue(RampInterpolation.CUBIC, [new RampPoint(0, 0.75), new RampPoint(1, 0.6)]);
	const rampValueJSON1 = rampValue1.toJSON();
	const rampValueJSON2 = rampValue2.toJSON();
	assert.notDeepEqual(rampValueJSON1, rampValueJSON2);

	function createRampNode(parent: SubnetGlNode | MeshBasicBuilderMatNode) {
		const ramp1 = parent.createNode('ramp');
		ramp1.p.name.set('myCustomRamp');
		return ramp1;
	}

	// only 1 param in subnet
	const ramp1 = createRampNode(subnet1);
	const floatToVec3_1 = subnet1.createNode('floatToVec3');
	floatToVec3_1.setInput(0, ramp1);
	subnet_subnetOutput1.setInput(0, floatToVec3_1);
	subnet1.setInputType(0, GlConnectionPointType.VEC3);
	subnet1.setInputName(0, 'pos');
	output1.setInput('color', subnet1);

	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(meshBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is not required');
	let uniform = materialUniforms(material)!['v_POLY_ramp_myCustomRamp'];
	assert.ok(uniform);
	assert.ok(uniform.value.uuid);
	let spareParam = meshBasicBuilder1.params.get('myCustomRamp')! as RampParam;
	assert.ok(spareParam);
	assert.notOk(spareParam.value.isEqual(rampValue1));
	assert.notOk(spareParam.value.isEqual(rampValue2));
	function firstPixelValue(texture: DataTexture) {
		return uniform.value.image.data[1] / 255;
	}

	assert.equal(firstPixelValue(uniform.value), 0);
	spareParam.set(rampValue2);
	assert.ok(spareParam.value.isEqual(rampValue2));
	assert.in_delta(firstPixelValue(uniform.value), 0.75, 0.05);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/ramp1
uniform sampler2D v_POLY_ramp_myCustomRamp;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/ramp1
		vec3 v_POLY_subnet1_ramp1_tmpTexureVarName = texture2D(v_POLY_ramp_myCustomRamp, vec2(0.0, 0.0)).xyz;
		float v_POLY_subnet1_ramp1_val = -1.0 + v_POLY_subnet1_ramp1_tmpTexureVarName.x + v_POLY_subnet1_ramp1_tmpTexureVarName.y + v_POLY_subnet1_ramp1_tmpTexureVarName.z;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_subnet1_pos;`
	);

	// only 1 param out of subnet
	subnet1.removeNode(ramp1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.not_includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/ramp1
uniform sampler2D v_POLY_ramp_myCustomRamp;`,
		'uniform is not declared anymore'
	);
	spareParam = meshBasicBuilder1.params.get('myCustomRamp')! as RampParam;
	assert.notOk(spareParam, 'spare param is removed');

	const ramp2 = createRampNode(meshBasicBuilder1);
	const floatToVec3_2 = meshBasicBuilder1.createNode('floatToVec3');
	floatToVec3_2.setInput(0, ramp2);
	output1.setInput('color', floatToVec3_2);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(meshBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is not required');
	uniform = materialUniforms(material)!['v_POLY_ramp_myCustomRamp'];
	assert.ok(uniform, 'uniform exists');
	assert.in_delta(firstPixelValue(uniform.value), 0.75, 0.05, 'uniform value is still previous one');
	spareParam = meshBasicBuilder1.params.get('myCustomRamp')! as RampParam;
	assert.ok(spareParam);
	spareParam.set(rampValue1);
	assert.in_delta(firstPixelValue(uniform.value), 0.25, 0.05);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/ramp1
uniform sampler2D v_POLY_ramp_myCustomRamp;`
	);
	// return;
	// assert.not_includes(
	// 	material.fragmentShader,
	// 	`// /MAT/meshBasicBuilder1/subnet1/vec3ToFloat1
	// 	float v_POLY_subnet1_vec3ToFloat1_x = v_POLY_param_test.x;`
	// );
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/ramp1
	vec3 v_POLY_ramp1_tmpTexureVarName = texture2D(v_POLY_ramp_myCustomRamp, vec2(0.0, 0.0)).xyz;
	float v_POLY_ramp1_val = -1.0 + v_POLY_ramp1_tmpTexureVarName.x + v_POLY_ramp1_tmpTexureVarName.y + v_POLY_ramp1_tmpTexureVarName.z;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_floatToVec3_1_vec3;`
	);

	// and with both param nodes
	const ramp3 = createRampNode(subnet1);
	floatToVec3_1.setInput(0, ramp3);
	const add1 = meshBasicBuilder1.createNode('add');
	add1.setInput(0, subnet1);
	add1.setInput(1, floatToVec3_2);
	output1.setInput('color', add1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(meshBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is not required');
	uniform = materialUniforms(material)!['v_POLY_ramp_myCustomRamp'];
	assert.ok(uniform, 'uniform exists');
	assert.in_delta(firstPixelValue(uniform.value), 0.25, 0.05, 'uniform value is still previous one');
	spareParam = meshBasicBuilder1.params.get('myCustomRamp')! as RampParam;
	assert.ok(spareParam);
	spareParam.set(rampValue2);
	assert.in_delta(firstPixelValue(uniform.value), 0.75, 0.05);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/ramp1
uniform sampler2D v_POLY_ramp_myCustomRamp;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/ramp1
		vec3 v_POLY_subnet1_ramp1_tmpTexureVarName = texture2D(v_POLY_ramp_myCustomRamp, vec2(0.0, 0.0)).xyz;
		float v_POLY_subnet1_ramp1_val = -1.0 + v_POLY_subnet1_ramp1_tmpTexureVarName.x + v_POLY_subnet1_ramp1_tmpTexureVarName.y + v_POLY_subnet1_ramp1_tmpTexureVarName.z;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/ramp1
	vec3 v_POLY_ramp1_tmpTexureVarName = texture2D(v_POLY_ramp_myCustomRamp, vec2(0.0, 0.0)).xyz;
	float v_POLY_ramp1_val = -1.0 + v_POLY_ramp1_tmpTexureVarName.x + v_POLY_ramp1_tmpTexureVarName.y + v_POLY_ramp1_tmpTexureVarName.z;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_add1_sum;`
	);

	RendererUtils.dispose();
});
