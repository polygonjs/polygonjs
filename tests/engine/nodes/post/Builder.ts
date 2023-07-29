import type {QUnit} from '../../../helpers/QUnit';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneObjNode} from './../../../../src/engine/nodes/obj/Scene';
import {BuilderPostNode} from './../../../../src/engine/nodes/post/Builder';
import {CoreSleep} from './../../../../src/core/Sleep';
import {Camera} from 'three';
import {ThreejsViewer} from './../../../../src/engine/viewers/Threejs';
import {HTMLElementWithViewer} from './../../../../src/engine/viewers/_Base';
import {RendererUtils} from './../../../helpers/RendererUtils';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {FloatParam} from '../../../../src/engine/params/Float';
import {GLSLHelper} from '../../../helpers/GLSLHelper';
export function testenginenodespostBuilder(qUnit: QUnit) {

qUnit.test('post/builder simple', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	// create an object to see from the viewer
	const sphere1 = window.geo1.createNode('sphere');
	sphere1.flags.display.set(true);
	scene.createNode('hemisphereLight');

	// create camera
	const cameras = scene.createNode('geo');
	cameras.setName('cameras');
	const perspectiveCamera1 = cameras.createNode('perspectiveCamera');
	perspectiveCamera1.setName('perspectiveCamera_MAIN');
	perspectiveCamera1.p.position.z.set(10);
	const cameraPostProcess1 = cameras.createNode('cameraPostProcess');
	cameraPostProcess1.setInput(0, perspectiveCamera1);
	const builder1 = cameraPostProcess1.createNode('builder');
	builder1.flags.display.set(true);
	cameraPostProcess1.flags.display.set(true);

	function createBuilderNodes(builder: BuilderPostNode) {
		const globals1 = builder.createNode('globals');
		const output1 = builder.createNode('output');

		const vec4ToVec3_1 = builder.createNode('vec4ToVec3');
		const multScalar1 = builder.createNode('multScalar');
		vec4ToVec3_1.setInput(0, globals1, 'input0');
		multScalar1.setInput(0, vec4ToVec3_1, 'vec3');

		multScalar1.params.get('mult')!.set(20);

		output1.setInput('color', multScalar1);
	}
	createBuilderNodes(builder1);

	await cameraPostProcess1.compute();
	await CoreSleep.sleep(50); // needed to be sure the new camera object is mounted
	const viewer = (await scene.camerasController.createMainViewer({
		autoRender: true,
		cameraMaskOverride: `*/${perspectiveCamera1.name()}`,
	}))! as ThreejsViewer<Camera>;
	assert.ok(viewer);

	await RendererUtils.withViewer({viewer, mount: true}, async ({viewer, element}) => {
		const elementWithScene = element as HTMLElementWithViewer<any>;
		assert.deepEqual(elementWithScene.scene, scene);
		assert.deepEqual(elementWithScene.viewer, viewer);
		assert.equal(viewer.camera().name, 'perspectiveCamera_MAIN');
		await CoreSleep.sleep(500);
	});
});

qUnit.test('post/builder using both inputs', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	function createScene1() {
		const scene1 = scene.createNode('scene');
		const geo1 = scene.createNode('geo');
		geo1.setInput(0, scene1);
		const perspectiveCamera = geo1.createNode('perspectiveCamera');
		const roundedBox = geo1.createNode('roundedBox');
		const hemisphereLight = geo1.createNode('hemisphereLight');
		const merge = geo1.createNode('merge');

		perspectiveCamera.p.position.z.set(5);
		hemisphereLight.p.skyColor.set([1, 0, 0]);
		hemisphereLight.p.groundColor.set([1, 0, 0]);

		merge.setInput(0, perspectiveCamera);
		merge.setInput(1, roundedBox);
		merge.setInput(2, hemisphereLight);
		merge.flags.display.set(true);
		return {scene1};
	}
	function createScene2() {
		const scene2 = scene.createNode('scene');
		const geo2 = scene.createNode('geo');
		geo2.setInput(0, scene2);
		const perspectiveCamera = geo2.createNode('perspectiveCamera');
		const sphere = geo2.createNode('sphere');
		const hemisphereLight = geo2.createNode('hemisphereLight');
		const merge = geo2.createNode('merge');

		perspectiveCamera.p.position.z.set(5);
		hemisphereLight.p.skyColor.set([0, 1, 0]);
		hemisphereLight.p.groundColor.set([0, 1, 0]);

		merge.setInput(0, perspectiveCamera);
		merge.setInput(1, sphere);
		merge.setInput(2, hemisphereLight);
		merge.flags.display.set(true);
		return {scene2};
	}

	function createCameraAndPost(scene1: SceneObjNode, scene2: SceneObjNode) {
		// create camera
		const cameras = scene.createNode('geo');
		cameras.setName('cameras');
		const perspectiveCamera_MAIN = cameras.createNode('perspectiveCamera');
		perspectiveCamera_MAIN.setName('perspectiveCamera_MAIN');
		perspectiveCamera_MAIN.p.position.z.set(5);
		const cameraPostProcess1 = cameras.createNode('cameraPostProcess');
		cameraPostProcess1.setInput(0, perspectiveCamera_MAIN);
		// render passes
		const render1 = cameraPostProcess1.createNode('render');
		const render2 = cameraPostProcess1.createNode('render');

		render1.p.overrideScene.set(1);
		render2.p.overrideScene.set(1);
		render1.p.scene.setNode(scene1);
		render2.p.scene.setNode(scene2);

		// builder pass
		const builder1 = cameraPostProcess1.createNode('builder');
		builder1.p.useInput1OuputBuffer.set(false);
		builder1.setInput(0, render1);
		builder1.setInput(1, render2);
		builder1.flags.display.set(true);
		cameraPostProcess1.flags.display.set(true);

		// null
		// const brightnessContrast1 = cameraPostProcess1.createNode('brightnessContrast');
		// perspectiveCamera_MAIN.flags.display.set(true);

		return {perspectiveCamera_MAIN, builder1, cameraPostProcess1};
	}

	function createBuilderNodes(builder: BuilderPostNode) {
		const globals1 = builder.createNode('globals');
		const output1 = builder.createNode('output');

		// two way switch
		const vec2ToFloat_1 = builder.createNode('vec2ToFloat');
		const param1 = builder.createNode('param');
		const compare1 = builder.createNode('compare');
		const twoWaySwitch1 = builder.createNode('twoWaySwitch');

		vec2ToFloat_1.setInput(0, globals1, 'uv');
		compare1.setInput(0, vec2ToFloat_1, 'x');
		compare1.setInput(1, param1);
		twoWaySwitch1.setInput(0, compare1);
		param1.p.name.set('l1');
		twoWaySwitch1.params.get('ifTrue')!.set(1);

		// mix
		const mix1 = builder.createNode('mix');
		const vec4ToVec3_1 = builder.createNode('vec4ToVec3');
		mix1.setInput(0, globals1, 'input0');
		mix1.setInput(1, globals1, 'input1');
		mix1.setInput(2, twoWaySwitch1);
		vec4ToVec3_1.setInput(0, mix1);

		output1.setInput('color', vec4ToVec3_1, 'vec3');
		output1.setInput('alpha', vec4ToVec3_1, 'w');
	}
	const {scene1} = createScene1();
	const {scene2} = createScene2();
	const {perspectiveCamera_MAIN, cameraPostProcess1, builder1} = createCameraAndPost(scene1, scene2);
	createBuilderNodes(builder1);

	await cameraPostProcess1.compute();
	await CoreSleep.sleep(50); // needed to be sure the new camera object is mounted
	const viewer = (await scene.camerasController.createMainViewer({
		autoRender: true,
		cameraMaskOverride: `*/${perspectiveCamera_MAIN.name()}`,
	}))! as ThreejsViewer<Camera>;
	assert.ok(viewer);

	/**
	 *
	 *  test persisted config
	 *
	 */
	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(builder1.usedAssembler(), async () => {
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const builder2 = scene2.node(builder1.path()) as BuilderPostNode;
		assert.notOk(builder2.assemblerController());
		assert.ok(builder2.persisted_config);
		const float_param = builder2.params.get('l1') as FloatParam;
		assert.ok(float_param, 'float param does not exist');
		assert.equal(GLSLHelper.compress(builder1.fragmentShader()), GLSLHelper.compress(builder2.fragmentShader()));
		const uniforms1 = builder1.uniforms();
		const uniforms2 = builder2.uniforms();
		assert.deepEqual(Object.keys(uniforms1).sort(), ['time', 'v_POLY_param_l1', 'v_POLY_param_param1']);
		assert.deepEqual(Object.keys(uniforms2).sort(), ['time', 'v_POLY_param_l1', 'v_POLY_param_param1']);
	});

	/**
	 *
	 * test viewer result
	 *
	 */
	await RendererUtils.withViewer({viewer, mount: true}, async ({viewer, element}) => {
		const elementWithScene = element as HTMLElementWithViewer<any>;
		assert.deepEqual(elementWithScene.scene, scene);
		assert.deepEqual(elementWithScene.viewer, viewer);
		assert.equal(viewer.camera().name, 'perspectiveCamera_MAIN');
		await CoreSleep.sleep(200);

		builder1.params.get('l1')!.set(0.45);
		await CoreSleep.sleep(200);
		builder1.params.get('l1')!.set(0.55);
		await CoreSleep.sleep(200);
	});
});

}