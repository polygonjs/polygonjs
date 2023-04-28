import {InstanceSopNode} from '../../../../src/engine/nodes/sop/Instance';
import {RenderPixelJsNodeOutputName} from '../../../../src/engine/nodes/js/RenderPixel';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {Vector2Param} from '../../../../src/engine/params/Vector2';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {BackgroundMode} from '../../../../src/engine/nodes/manager/utils/Scene/Background';
import {MeshBasicMaterial} from 'three';
import {ColorParam} from '../../../../src/engine/params/Color';

export function createRequiredNodes(node: InstanceSopNode) {
	const MAT = window.MAT;
	const meshMat = MAT.createNode('meshBasicBuilder');
	const output1 = meshMat.createNode('output');
	const instance_transform1 = meshMat.createNode('instanceTransform');

	output1.setInput('position', instance_transform1, 'position');
	output1.setInput('normal', instance_transform1, 'normal');

	const attrib1 = meshMat.createNode('attribute');
	const floatToVec3_1 = meshMat.createNode('floatToVec3');
	const hsvToRgb1 = meshMat.createNode('hsvToRgb');
	attrib1.p.name.set('idn');
	floatToVec3_1.setInput(0, attrib1);
	hsvToRgb1.setInput(0, floatToVec3_1);
	floatToVec3_1.p.y.set(1);
	floatToVec3_1.p.z.set(0.5);
	output1.setInput('color', hsvToRgb1);

	node.p.material.setNode(meshMat);

	return {output1};
}

QUnit.test('js/renderPixel', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(8);
	cameraNode.p.t.y.set(2.5);
	scene.root().sceneBackgroundController.setMode(BackgroundMode.COLOR);
	scene.root().p.bgColor.set([1, 0, 0]);

	// instanced sphere
	const line1 = geo1.createNode('line');
	const sphere1 = geo1.createNode('sphere');
	const instance1 = geo1.createNode('instance');
	const attribId1 = geo1.createNode('attribId');
	instance1.setInput(0, sphere1);
	attribId1.setInput(0, line1);
	instance1.setInput(1, attribId1);
	createRequiredNodes(instance1);

	sphere1.p.radius.set(0.5);
	line1.p.length.set(5);
	line1.p.pointsCount.set(6);
	instance1.p.attributesToCopy.set('instance* id*');

	// box to change color of
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	const meshBasic1 = MAT.createNode('meshBasic');
	const actor1 = geo1.createNode('actor');

	material1.setInput(0, box1);
	actor1.setInput(0, material1);
	meshBasic1.p.color.set([1, 1, 1]);
	material1.p.material.setNode(meshBasic1);
	box1.p.center.set([0, -10, 0]);

	// add merge
	const merge1 = geo1.createNode('merge');
	merge1.setInput(0, instance1);
	merge1.setInput(1, actor1);
	merge1.flags.display.set(true);

	// setup actor
	const onTick1 = actor1.createNode('onTick');
	const setMaterialColor1 = actor1.createNode('setMaterialColor');
	const renderPixel1 = actor1.createNode('renderPixel');
	const getSibbling1 = actor1.createNode('getSibbling');
	const getDefaultCamera1 = actor1.createNode('getDefaultCamera');
	const vec4ToVec3_1 = actor1.createNode('vec4ToVec3');
	const vec3ToColor_1 = actor1.createNode('vec3ToColor');
	const cursorToUv1 = actor1.createNode('cursorToUv');
	const paramCursor = actor1.createNode('param');
	const paramBgColor = actor1.createNode('param');

	renderPixel1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	renderPixel1.setInput(JsConnectionPointType.OBJECT_3D, getSibbling1);
	renderPixel1.setInput(JsConnectionPointType.CAMERA, getDefaultCamera1);
	renderPixel1.setInput(renderPixel1.p.uv.name(), cursorToUv1);

	setMaterialColor1.setInput(JsConnectionPointType.TRIGGER, renderPixel1);
	setMaterialColor1.setInput(setMaterialColor1.p.color.name(), vec3ToColor_1);
	vec3ToColor_1.setInput(0, vec4ToVec3_1);
	vec4ToVec3_1.setInput(0, renderPixel1, RenderPixelJsNodeOutputName.value);

	paramCursor.setJsType(JsConnectionPointType.VECTOR2);
	paramCursor.p.name.set('cursor');
	cursorToUv1.setInput(0, paramCursor);

	paramBgColor.setJsType(JsConnectionPointType.COLOR);
	paramBgColor.p.name.set('bgColor');
	renderPixel1.setInput(renderPixel1.p.backgroundColor.name(), paramBgColor);

	const materialContainer = await meshBasic1.compute();
	const material = materialContainer.material() as MeshBasicMaterial;

	await CoreSleep.sleep(100);
	const cursor = actor1.params.get('cursor') as Vector2Param;
	assert.ok(cursor);
	assert.equal(cursor.type(), ParamType.VECTOR2);
	const bgColor = actor1.params.get('bgColor') as ColorParam;
	assert.ok(bgColor);
	assert.equal(bgColor.type(), ParamType.COLOR);

	function assertColor(r: number, g: number, b: number, message: string) {
		assert.in_delta(material.color.r, r, 0.01, `${message} (r)`);
		assert.in_delta(material.color.g, g, 0.01, `${message} (g)`);
		assert.in_delta(material.color.b, b, 0.01, `${message} (b)`);
	}

	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		assert.deepEqual(material.color.toArray(), [1, 1, 1]);
		assertColor(1, 1, 1, 'before changes');

		cursor.set([0, 0.1]);
		await CoreSleep.sleep(50);
		assertColor(0, 0.2, 0.5, 'center up');

		cursor.set([0, -0.1]);
		await CoreSleep.sleep(50);
		assertColor(0, 0.5, 0.20000004768371582, 'center down');

		cursor.set([-0.5, 0.5]);
		await CoreSleep.sleep(50);
		assertColor(1, 1, 1, 'side');

		bgColor.set([1, 0.5, 0.25]);
		await CoreSleep.sleep(50);
		assertColor(1, 0.5, 0.25, 'side');
	});
});
