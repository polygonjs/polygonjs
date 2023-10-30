import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {SetParamJsNodeInputName} from '../../../../src/engine/nodes/js/SetParam';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {
	triggerPointerdownAside,
	triggerPointerupInMiddle,
	triggerPointerdownInMiddle,
} from '../../../helpers/EventsHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {InstanceSopNode} from '../../../../src/engine/nodes/sop/Instance';
import {OnObjectPointerEventGPUJsNodeOutputName} from '../../../../src/engine/nodes/js/_BaseOnObjectPointerEvent';

function createMaterial() {
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const output1 = meshBasicBuilder1.createNode('output');
	const instance_transform1 = meshBasicBuilder1.createNode('instanceTransform');

	output1.setInput('position', instance_transform1, 'position');
	output1.setInput('normal', instance_transform1, 'normal');

	return {meshBasicBuilder1, output1};
}

function createRequiredNodes(node: InstanceSopNode) {
	const {meshBasicBuilder1, output1} = createMaterial();

	node.p.material.set(meshBasicBuilder1.path());

	return {output1};
}

export function testenginenodesjsOnObjectLongPressGPU(qUnit: QUnit) {
	qUnit.test('js/onObjectLongPressGPU', async (assert) => {
		const scene = window.scene;
		// const MAT = window.MAT;
		const perspective_camera1 = window.perspective_camera1;

		perspective_camera1.p.t.set([0, 0, 5]);

		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const add1 = geo1.createNode('add');
		const instance1 = geo1.createNode('instance');
		const transform1 = geo1.createNode('transform');
		const actor1 = geo1.createNode('actor');
		//
		const geo2 = scene.root().createNode('geo');
		// const sphere1 = geo2.createNode('sphere');

		// const meshBasic1 = MAT.createNode('meshBasic');
		// meshBasic1.p.color.set([1, 0, 0]);
		// material1.p.material.setNode(meshBasic1);
		createRequiredNodes(instance1);

		transform1.setApplyOn(TransformTargetType.OBJECT);
		transform1.p.t.set([0, 0, 0.5]);

		instance1.setInput(0, box1);
		instance1.setInput(1, add1);
		transform1.setInput(0, instance1);
		// material1.setInput(0, transform1);
		actor1.setInput(0, transform1);
		actor1.flags.display.set(true);
		// actor1.io.inputs.overrideClonedState(true);

		const onObjectLongPressGPU1 = actor1.createNode('onObjectLongPressGPU');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const getObjectProperty1 = actor1.createNode('getObjectProperty');
		const negate1 = actor1.createNode('negate');
		const setParam1 = actor1.createNode('setParam');

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectLongPressGPU1);
		// setObjectPosition1.p.position.set([0, 0, 1]);
		setObjectPosition1.setInput('position', negate1);
		negate1.setInput(0, getObjectProperty1);
		//
		setParam1.setInput(JsConnectionPointType.TRIGGER, onObjectLongPressGPU1);
		setParam1.setInput(
			SetParamJsNodeInputName.val,
			onObjectLongPressGPU1,
			OnObjectPointerEventGPUJsNodeOutputName.distance
		);
		setParam1.setParamType(JsConnectionPointType.FLOAT);
		setParam1.setParamParam(geo2.p.scale);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0];

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			const {viewer} = args;
			const canvas = viewer.canvas();
			scene.play();
			assert.equal(scene.time(), 0);
			assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'position 0');
			assert.equal(geo2.p.scale.value, 1, 'scale');

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(100);
			triggerPointerupInMiddle(document);
			assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'no pos set');
			assert.in_delta(geo2.p.scale.value, 1, 0.001, 'no change');

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(700);
			triggerPointerupInMiddle(document);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos set 1');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'change');

			triggerPointerdownAside(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'position unset');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'no change');

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(700);
			triggerPointerupInMiddle(document);
			assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'pos set 2');
			assert.in_delta(geo2.p.scale.value, 5, 0.001, 'scale');

			// test intersection: point
			// scene.batchUpdates(() => {
			// 	setParam1.setInput(
			// 		SetParamJsNodeInputName.val,
			// 		getIntersectionProperty1,
			// 		GetIntersectionPropertyJsNodeOutputName.point
			// 	);
			// 	setParam1.setParamType(JsConnectionPointType.VECTOR3);
			// 	setParam1.setParamParam(geo2.p.s);
			// });
			// await CoreSleep.sleep(100);
			// triggerPointerdown(canvas, {x: 0.01, y: 0.01});
			// await CoreSleep.sleep(700);
			// triggerPointerup(document, {x: 0.01, y: 0.01});
			// await CoreSleep.sleep(200);
			// assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos array check');
			// const tmpV3 = geo2.p.s.value.toArray();

			// assert.in_delta(tmpV3[0], 0.0373046126523999, 0.001, 's');
			// assert.in_delta(tmpV3[1], -0.03730461265239991, 0.001, 's');
			// assert.in_delta(tmpV3[2], 1, 0.001, 's');
			// object.position.set(0, 0, 0);

			// test intersection: uv
			// await scene.batchUpdates(() => {
			// setParam1.setInput(
			// 	SetParamJsNodeInputName.val,
			// 	getIntersectionProperty1,
			// 	GetIntersectionPropertyJsNodeOutputName.uv
			// );
			// setParam1.setParamType(JsConnectionPointType.VECTOR2);
			// // we need a delay here,
			// // so that the param type change is taken into account
			// // when the node recompiles
			// await CoreSleep.sleep(50);
			// setParam1.setParamParam(sphere1.p.resolution);
			// // });
			// await CoreSleep.sleep(100);
			// triggerPointerdown(canvas, {x: 0.01, y: 0.01});
			// await CoreSleep.sleep(700);
			// triggerPointerup(document, {x: 0.01, y: 0.01});
			// await CoreSleep.sleep(200);
			// assert.deepEqual(object.position.toArray(), [0, 0, 0]);
			// const tmpV2 = sphere1.p.resolution.value.toArray();
			// assert.in_delta(tmpV2[0], 0.5466307658154999, 0.001, 'uv');
			// assert.in_delta(tmpV2[1], 0.4533692341845001, 0.001, 'uv');
			// object.position.set(0, 0, 0);
		});
	});
}
