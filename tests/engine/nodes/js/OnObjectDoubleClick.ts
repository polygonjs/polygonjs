import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {GetIntersectionPropertyJsNodeOutputName} from '../../../../src/engine/nodes/js/GetIntersectionProperty';
import {SetParamJsNodeInputName} from '../../../../src/engine/nodes/js/SetParam';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {triggerDoubleClickAside, triggerDoubleClickInMiddle, triggerDoubleClick} from '../../../helpers/EventsHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CursorMoveMonitor} from '../../../../src/core/CursorMoveMonitor';
import {MouseButton} from '../../../../src/core/MouseButton';
import {STATUS_OPTIONS, Status} from '../../../../src/engine/scene/utils/actors/rayObjectIntersection/Common';
export function testenginenodesjsOnObjectDoubleClick(qUnit: QUnit) {
	qUnit.test('js/onObjectDoubleClick', async (assert) => {
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

		const onObjectDoubleClick1 = actor1.createNode('onObjectDoubleClick');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const getObjectProperty1 = actor1.createNode('getObjectProperty');
		const negate1 = actor1.createNode('negate');
		const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
		const setParam1 = actor1.createNode('setParam');

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectDoubleClick1);
		// setObjectPosition1.p.position.set([0, 0, 1]);
		setObjectPosition1.setInput('position', negate1);
		negate1.setInput(0, getObjectProperty1);
		//
		getIntersectionProperty1.setInput(0, onObjectDoubleClick1, JsConnectionPointType.INTERSECTION);
		setParam1.setInput(JsConnectionPointType.TRIGGER, onObjectDoubleClick1);
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

			await triggerDoubleClickInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos set');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

			await triggerDoubleClickAside(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'position unset');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

			await triggerDoubleClickInMiddle(canvas);
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
			await triggerDoubleClick(canvas, {x: 0.01, y: 0.01});
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
			await triggerDoubleClick(canvas, {x: 0.01, y: 0.01});
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

	qUnit.test(
		'js/onObjectDoubleClick with 2 onObjectDoubleClick with different buttons do not trigger one another',
		async (assert) => {
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

			const onObjectDoubleClick1 = actor1.createNode('onObjectDoubleClick');
			const onObjectDoubleClick2 = actor1.createNode('onObjectDoubleClick');
			const setObjectPosition1 = actor1.createNode('setObjectPosition');
			const setObjectPosition2 = actor1.createNode('setObjectPosition');

			setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectDoubleClick1);
			setObjectPosition2.setInput(JsConnectionPointType.TRIGGER, onObjectDoubleClick2);

			onObjectDoubleClick1.p.ctrl.set(STATUS_OPTIONS.indexOf(Status.REQUIRED));
			// onObjectDoubleClick1.p.buttonMiddle.set(false);
			// onObjectDoubleClick1.p.buttonRight.set(false);
			onObjectDoubleClick2.p.shift.set(STATUS_OPTIONS.indexOf(Status.REQUIRED));
			// onObjectDoubleClick2.p.buttonMiddle.set(false);
			// onObjectDoubleClick2.p.buttonRight.set(true);

			setObjectPosition1.p.position.set([0, 0, 1]);
			setObjectPosition2.p.position.set([0, 0, -1]);

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

				await triggerDoubleClickInMiddle(canvas, MouseButton.LEFT, {ctrl: true});
				await CoreSleep.sleep(100);
				assert.deepEqual(object.position.toArray(), [0, 0, 1], 'left');

				await triggerDoubleClickAside(canvas, MouseButton.LEFT, {shift: true});
				await CoreSleep.sleep(100);
				assert.deepEqual(object.position.toArray(), [0, 0, 1], 'left missed');

				await triggerDoubleClickInMiddle(canvas, MouseButton.LEFT, {shift: true});
				await CoreSleep.sleep(100);
				assert.deepEqual(object.position.toArray(), [0, 0, -1], 'left');

				await triggerDoubleClickInMiddle(canvas, MouseButton.LEFT, {ctrl: true});
				await CoreSleep.sleep(100);
				assert.deepEqual(object.position.toArray(), [0, 0, 1], 'left');

				cursorMoveMonitor.removeEventListener();
				if (cursorMoveMonitor.movedCursorDistance() > 0.05) {
					console.error('DO NOT MOVE CURSOR WHILE TEST IS RUNNING');
				}
			});
		}
	);
}
