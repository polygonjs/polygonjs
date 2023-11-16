import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {GetIntersectionPropertyJsNodeOutputName} from '../../../../src/engine/nodes/js/GetIntersectionProperty';
import {SetParamJsNodeInputName} from '../../../../src/engine/nodes/js/SetParam';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {
	triggerMousedownAndMouseupAside,
	triggerMousedownAndMouseupInMiddle,
	triggerMousedownAndMouseup,
} from '../../../helpers/EventsHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CursorMoveMonitor} from '../../../../src/core/CursorMoveMonitor';
import {STATUS_OPTIONS, Status} from '../../../../src/engine/scene/utils/actors/rayObjectIntersection/Common';
import {MouseButtons} from '../../../../src/core/MouseButton';
export function testenginenodesjsOnObjectMouseClick(qUnit: QUnit) {
	qUnit.test('js/onObjectMouseClick', async (assert) => {
		const scene = window.scene;
		const MAT = window.MAT;
		const perspective_camera1 = window.perspective_camera1;

		perspective_camera1.p.t.set([0, 0, 5]);

		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');
		const material1 = geo1.createNode('material');
		const actor1 = geo1.createNode('actor');
		//
		const geo2 = scene.root().createNode('geo');
		const sphere1 = geo2.createNode('sphere');

		const meshBasic1 = MAT.createNode('meshBasic');
		meshBasic1.p.color.set([1, 0, 0]);
		material1.p.material.setNode(meshBasic1);

		transform1.setApplyOn(TransformTargetType.OBJECT);
		transform1.p.t.set([0, 0, 0.5]);

		actor1.setInput(0, material1);
		material1.setInput(0, transform1);
		transform1.setInput(0, box1);
		actor1.flags.display.set(true);
		// actor1.io.inputs.overrideClonedState(true);

		const onObjectMouseClick1 = actor1.createNode('onObjectMouseClick');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const getObjectProperty1 = actor1.createNode('getObjectProperty');
		const negate1 = actor1.createNode('negate');
		const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
		const setParam1 = actor1.createNode('setParam');

		onObjectMouseClick1.p.maxDuration.set(500);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectMouseClick1);
		// setObjectPosition1.p.position.set([0, 0, 1]);
		setObjectPosition1.setInput('position', negate1);
		negate1.setInput(0, getObjectProperty1);
		//
		getIntersectionProperty1.setInput(0, onObjectMouseClick1, JsConnectionPointType.INTERSECTION);
		setParam1.setInput(JsConnectionPointType.TRIGGER, onObjectMouseClick1);
		setParam1.setInput(
			SetParamJsNodeInputName.val,
			getIntersectionProperty1,
			GetIntersectionPropertyJsNodeOutputName.distance
		);
		setParam1.setParamType(JsConnectionPointType.FLOAT);
		setParam1.setParamParam(geo2.p.scale);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0];

		const cursorMoveMonitor = new CursorMoveMonitor();
		cursorMoveMonitor.addPointermoveEventListener(scene.eventsDispatcher.pointerEventsController.cursor());

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			const {viewer} = args;
			const canvas = viewer.canvas();
			scene.play();
			assert.equal(scene.time(), 0, 'time is 0');
			assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'position 0');
			assert.equal(geo2.p.scale.value, 1, 'scale');

			await triggerMousedownAndMouseupInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos set');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

			await triggerMousedownAndMouseupAside(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'position unset');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

			await triggerMousedownAndMouseupInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'pos set');
			assert.in_delta(geo2.p.scale.value, 5, 0.001, 'scale');

			// test intersection: point
			scene.batchUpdates(() => {
				setParam1.setInput(
					SetParamJsNodeInputName.val,
					getIntersectionProperty1,
					GetIntersectionPropertyJsNodeOutputName.point
				);
				setParam1.setParamType(JsConnectionPointType.VECTOR3);
				setParam1.setParamParam(geo2.p.s);
			});
			await CoreSleep.sleep(100);
			await triggerMousedownAndMouseup(canvas, {x: 0.01, y: 0.01});
			await CoreSleep.sleep(200);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5]);
			const tmpV3 = geo2.p.s.value.toArray();

			assert.in_delta(tmpV3[0], 0.0373046126523999, 0.001, 's');
			assert.in_delta(tmpV3[1], -0.03730461265239991, 0.001, 's');
			assert.in_delta(tmpV3[2], 1, 0.001, 's');
			object.position.set(0, 0, 0);

			// test intersection: uv
			// await scene.batchUpdates(() => {
			setParam1.setInput(
				SetParamJsNodeInputName.val,
				getIntersectionProperty1,
				GetIntersectionPropertyJsNodeOutputName.uv
			);
			setParam1.setParamType(JsConnectionPointType.VECTOR2);
			// we need a delay here,
			// so that the param type change is taken into account
			// when the node recompiles
			await CoreSleep.sleep(50);
			setParam1.setParamParam(sphere1.p.resolution);
			// });
			await CoreSleep.sleep(100);
			await triggerMousedownAndMouseup(canvas, {x: 0.01, y: 0.01});
			await CoreSleep.sleep(200);
			assert.deepEqual(object.position.toArray(), [0, 0, 0]);
			const tmpV2 = sphere1.p.resolution.value.toArray();
			assert.in_delta(tmpV2[0], 0.5466307658154999, 0.001, 'uv');
			assert.in_delta(tmpV2[1], 0.4533692341845001, 0.001, 'uv');
			object.position.set(0, 0, 0);

			cursorMoveMonitor.removeEventListener();
			if (cursorMoveMonitor.movedCursorDistance() > 0.05) {
				console.error('DO NOT MOVE CURSOR WHILE TEST IS RUNNING');
			}
		});
	});

	qUnit.test('js/onObjectMouseClick with left+right buttons', async (assert) => {
		const scene = window.scene;
		const MAT = window.MAT;
		const perspective_camera1 = window.perspective_camera1;

		perspective_camera1.p.t.set([0, 0, 5]);

		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');
		const material1 = geo1.createNode('material');
		const actor1 = geo1.createNode('actor');
		//
		const geo2 = scene.root().createNode('geo');

		const meshBasic1 = MAT.createNode('meshBasic');
		meshBasic1.p.color.set([1, 0, 0]);
		material1.p.material.setNode(meshBasic1);

		transform1.setApplyOn(TransformTargetType.OBJECT);
		transform1.p.t.set([0, 0, 0.5]);

		actor1.setInput(0, material1);
		material1.setInput(0, transform1);
		transform1.setInput(0, box1);
		actor1.flags.display.set(true);
		// actor1.io.inputs.overrideClonedState(true);

		const onObjectMouseClick1 = actor1.createNode('onObjectMouseClick');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const getObjectProperty1 = actor1.createNode('getObjectProperty');
		const negate1 = actor1.createNode('negate');
		const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
		const setParam1 = actor1.createNode('setParam');

		onObjectMouseClick1.p.buttonLeft.set(STATUS_OPTIONS.indexOf(Status.REQUIRED));
		onObjectMouseClick1.p.buttonMiddle.set(STATUS_OPTIONS.indexOf(Status.FORBIDDEN));
		onObjectMouseClick1.p.buttonRight.set(STATUS_OPTIONS.indexOf(Status.REQUIRED));
		onObjectMouseClick1.p.maxDuration.set(500);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectMouseClick1);
		// setObjectPosition1.p.position.set([0, 0, 1]);
		setObjectPosition1.setInput('position', negate1);
		negate1.setInput(0, getObjectProperty1);
		//
		getIntersectionProperty1.setInput(0, onObjectMouseClick1, JsConnectionPointType.INTERSECTION);
		setParam1.setInput(JsConnectionPointType.TRIGGER, onObjectMouseClick1);
		setParam1.setInput(
			SetParamJsNodeInputName.val,
			getIntersectionProperty1,
			GetIntersectionPropertyJsNodeOutputName.distance
		);
		setParam1.setParamType(JsConnectionPointType.FLOAT);
		setParam1.setParamParam(geo2.p.scale);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0];

		const cursorMoveMonitor = new CursorMoveMonitor();
		cursorMoveMonitor.addPointermoveEventListener(scene.eventsDispatcher.pointerEventsController.cursor());

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			const {viewer} = args;
			const canvas = viewer.canvas();
			scene.play();
			assert.equal(scene.time(), 0, 'time is 0');
			assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'position 0');
			assert.equal(geo2.p.scale.value, 1, 'scale');

			await triggerMousedownAndMouseupInMiddle(canvas, {buttons: MouseButtons.LEFT_RIGHT});
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos set');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

			await triggerMousedownAndMouseupInMiddle(canvas, {buttons: MouseButtons.LEFT});
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'position unset');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

			await triggerMousedownAndMouseupInMiddle(canvas, {buttons: MouseButtons.LEFT_RIGHT});
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'pos set');
			assert.in_delta(geo2.p.scale.value, 5, 0.001, 'scale');
		});
	});
}
