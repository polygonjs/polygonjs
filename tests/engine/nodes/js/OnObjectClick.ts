import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {GetIntersectionPropertyJsNodeOutputName} from '../../../../src/engine/nodes/js/GetIntersectionProperty';
import {SetParamJsNodeInputName} from '../../../../src/engine/nodes/js/SetParam';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {
	triggerPointerdownAndPointerupAside,
	triggerPointerdownAndPointerupInMiddle,
	triggerPointerdownAndPointerup,
} from '../../../helpers/EventsHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CursorMoveMonitor} from '../../../../src/core/CursorMoveMonitor';
import {MouseButton} from '../../../../src/core/MouseButton';
import {Object3D} from 'three';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';

export function testenginenodesjsOnObjectClick(qUnit: QUnit) {
	qUnit.test('js/onObjectClick', async (assert) => {
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

		const onObjectClick1 = actor1.createNode('onObjectClick');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const getObjectProperty1 = actor1.createNode('getObjectProperty');
		const negate1 = actor1.createNode('negate');
		const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
		const setParam1 = actor1.createNode('setParam');

		onObjectClick1.p.maxDuration.set(500);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectClick1);
		// setObjectPosition1.p.position.set([0, 0, 1]);
		setObjectPosition1.setInput('position', negate1);
		negate1.setInput(0, getObjectProperty1);
		//
		getIntersectionProperty1.setInput(0, onObjectClick1, JsConnectionPointType.INTERSECTION);
		setParam1.setInput(JsConnectionPointType.TRIGGER, onObjectClick1);
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

			await triggerPointerdownAndPointerupInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos set');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

			await triggerPointerdownAndPointerupAside(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'position unset');
			assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

			await triggerPointerdownAndPointerupInMiddle(canvas);
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
			await triggerPointerdownAndPointerup(canvas, {x: 0.01, y: 0.01});
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
			await triggerPointerdownAndPointerup(canvas, {x: 0.01, y: 0.01});
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
		'js/onObjectClick with 2 onObjectClick with different buttons do not trigger one another',
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

			const onObjectClick1 = actor1.createNode('onObjectClick');
			const onObjectClick2 = actor1.createNode('onObjectClick');
			const setObjectPosition1 = actor1.createNode('setObjectPosition');
			const setObjectPosition2 = actor1.createNode('setObjectPosition');

			setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectClick1);
			setObjectPosition2.setInput(JsConnectionPointType.TRIGGER, onObjectClick2);

			onObjectClick1.p.maxDuration.set(500);
			onObjectClick2.p.maxDuration.set(500);

			onObjectClick1.p.buttonLeft.set(true);
			onObjectClick1.p.buttonMiddle.set(false);
			onObjectClick1.p.buttonRight.set(false);
			onObjectClick2.p.buttonLeft.set(false);
			onObjectClick2.p.buttonMiddle.set(false);
			onObjectClick2.p.buttonRight.set(true);

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

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.LEFT);
				await CoreSleep.sleep(100);
				assert.deepEqual(object.position.toArray(), [0, 0, 1], 'left');

				await triggerPointerdownAndPointerupAside(canvas, MouseButton.RIGHT);
				await CoreSleep.sleep(100);
				assert.deepEqual(object.position.toArray(), [0, 0, 1], 'right missed');

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.RIGHT);
				await CoreSleep.sleep(100);
				assert.deepEqual(object.position.toArray(), [0, 0, -1], 'right');

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.LEFT);
				await CoreSleep.sleep(100);
				assert.deepEqual(object.position.toArray(), [0, 0, 1], 'left');

				cursorMoveMonitor.removeEventListener();
				if (cursorMoveMonitor.movedCursorDistance() > 0.05) {
					console.error('DO NOT MOVE CURSOR WHILE TEST IS RUNNING');
				}
			});
		}
	);

	qUnit.test(
		'js/onObjectClick in 2 different actors do not block one another when computed at different times',
		async (assert) => {
			const scene = window.scene;
			const perspective_camera1 = window.perspective_camera1;

			perspective_camera1.p.t.set([0, 0, 5]);

			const geo2 = scene.root().createNode('geo');

			const geo1 = window.geo1;
			const box1 = geo1.createNode('box');
			const objectProperties1 = geo1.createNode('objectProperties');
			const actor1 = geo1.createNode('actor');
			const actor2 = geo1.createNode('actor');
			objectProperties1.setInput(0, box1);
			actor1.setInput(0, objectProperties1);
			actor2.setInput(0, actor1);

			objectProperties1.p.tname.set(1);
			objectProperties1.p.name.set('clickTarget');

			const onObjectClick1 = actor1.createNode('onObjectClick');
			const onObjectClick2 = actor2.createNode('onObjectClick');
			const setParam1 = actor1.createNode('setParam');
			const setParam2 = actor2.createNode('setParam');

			setParam1.setInput(0, onObjectClick1);
			setParam2.setInput(0, onObjectClick2);
			setParam1.setParamParam(geo2.p.scale);
			setParam2.setParamParam(geo2.p.scale);
			setParam1.setParamType(JsConnectionPointType.FLOAT);
			setParam2.setParamType(JsConnectionPointType.FLOAT);
			setParam1.params.get(SetParamJsNodeInputName.val)?.set(2);
			setParam2.params.get(SetParamJsNodeInputName.val)?.set(3);

			actor1.flags.display.set(true);
			const container1 = await actor1.compute();
			const object1 = container1.coreContent()!.threejsObjects()[0];
			assert.equal(object1.name, 'clickTarget');
			await CoreSleep.sleep(100);

			const cursorMoveMonitor = new CursorMoveMonitor();
			cursorMoveMonitor.addPointermoveEventListener(scene.eventsDispatcher.pointerEventsController.cursor());

			await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
				const {viewer} = args;
				const canvas = viewer.canvas();
				scene.play();
				await CoreSleep.sleep(100);

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.LEFT);
				await CoreSleep.sleep(100);
				assert.equal(geo2.p.scale.value, 2, 'scale 2');
				const _objects: Object3D[] = [];
				scene.actorsManager.rayObjectIntersectionClick.objects(_objects);
				assert.equal(_objects.length, 1);
				assert.equal(_objects[0].uuid, object1.uuid);

				// now we display the second actor node,
				// and check that the object generated by the first one are removed from the click controller
				actor2.flags.display.set(true);
				const container2 = await actor2.compute();
				const object2 = container2.coreContent()!.threejsObjects()[0];
				assert.equal(object2.name, 'clickTarget');
				assert.notEqual(object1.uuid, object2.uuid, 'uuids are different');
				await CoreSleep.sleep(100);

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.LEFT);
				await CoreSleep.sleep(100);
				assert.equal(geo2.p.scale.value, 3, 'scale 3');

				scene.actorsManager.rayObjectIntersectionClick.objects(_objects);
				assert.equal(_objects.length, 1);
				assert.equal(_objects[0].uuid, object2.uuid);

				cursorMoveMonitor.removeEventListener();
				if (cursorMoveMonitor.movedCursorDistance() > 0.05) {
					console.error('DO NOT MOVE CURSOR WHILE TEST IS RUNNING');
				}
			});
		}
	);

	qUnit.test(
		'js/onObjectClick in 2 different actors in different geo do not block one another when computed at different times',
		async (assert) => {
			const scene = window.scene;
			const perspective_camera1 = window.perspective_camera1;

			perspective_camera1.p.t.set([0, 0, 5]);

			// geo nodes
			const geo1 = window.geo1;
			const geo2 = scene.root().createNode('geo');
			const geo3 = scene.root().createNode('geo');

			// setup
			function _setupGeo1(geo: GeoObjNode) {
				const box1 = geo.createNode('box');
				const objectProperties1 = geo.createNode('objectProperties');
				const actor1 = geo.createNode('actor');
				objectProperties1.setInput(0, box1);
				actor1.setInput(0, objectProperties1);
				objectProperties1.p.tname.set(true);
				objectProperties1.p.name.set('box');

				const onObjectClick1 = actor1.createNode('onObjectClick');
				const setParam1 = actor1.createNode('setParam');
				const getObject1 = actor1.createNode('getObject');

				setParam1.setInput(0, onObjectClick1);
				onObjectClick1.setInput(JsConnectionPointType.OBJECT_3D, getObject1);
				setParam1.setParamParam(geo3.p.scale);
				setParam1.setParamType(JsConnectionPointType.FLOAT);
				setParam1.params.get(SetParamJsNodeInputName.val)?.set(2);

				getObject1.p.getCurrentObject.set(false);
				getObject1.p.mask.set('*/sphere');

				return {actor1};
			}
			function _setupGeo2(geo: GeoObjNode) {
				const sphere1 = geo.createNode('sphere');
				const objectProperties1 = geo.createNode('objectProperties');
				const actor1 = geo.createNode('actor');
				objectProperties1.setInput(0, sphere1);
				actor1.setInput(0, objectProperties1);
				objectProperties1.p.tname.set(true);
				objectProperties1.p.name.set('sphere');

				const onObjectClick1 = actor1.createNode('onObjectClick');
				const setParam1 = actor1.createNode('setParam');

				setParam1.setInput(0, onObjectClick1);
				setParam1.setParamParam(geo3.p.scale);
				setParam1.setParamType(JsConnectionPointType.FLOAT);
				setParam1.params.get(SetParamJsNodeInputName.val)?.set(3);

				return {objectProperties1, actor1};
			}
			const geo1Nodes = _setupGeo1(geo1);
			const geo2Nodes = _setupGeo2(geo2);

			geo1Nodes.actor1.flags.display.set(true);
			geo2Nodes.objectProperties1.flags.display.set(true);

			const container1 = await geo1Nodes.actor1.compute();
			const container2 = await geo2Nodes.objectProperties1.compute();
			const object1 = container1.coreContent()!.threejsObjects()[0];
			const object2 = container2.coreContent()!.threejsObjects()[0];

			assert.equal(object1.name, 'box');
			assert.equal(object2.name, 'sphere');

			// wait to make sure objects are mounted to the scene
			await CoreSleep.sleep(150);

			const cursorMoveMonitor = new CursorMoveMonitor();
			cursorMoveMonitor.addPointermoveEventListener(scene.eventsDispatcher.pointerEventsController.cursor());

			await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
				const {viewer} = args;
				const canvas = viewer.canvas();
				scene.play();
				assert.equal(scene.time(), 0, 'time is 0');
				assert.equal(geo3.p.scale.value, 1, 'scale starts at 1');

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.LEFT);
				await CoreSleep.sleep(100);
				assert.equal(geo3.p.scale.value, 2, 'scale is now 2');

				const _objects: Object3D[] = [];
				scene.actorsManager.rayObjectIntersectionClick.objects(_objects);
				assert.equal(_objects.length, 1);
				assert.equal(_objects[0].uuid, object2.uuid);

				// now let's display sphere actor node,
				// and check that the ray click controller does not end up containing 2 spheres
				geo2Nodes.actor1.flags.display.set(true);
				const container3 = await geo2Nodes.actor1.compute();
				const object2b = container3.coreContent()!.threejsObjects()[0];
				await CoreSleep.sleep(100);

				scene.actorsManager.rayObjectIntersectionClick.objects(_objects);
				assert.equal(_objects.length, 1, 'still 1 object');
				assert.equal(_objects[0].uuid, object2b.uuid);

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.LEFT);
				await CoreSleep.sleep(100);
				assert.equal(geo3.p.scale.value, 3, 'scale is now 3');

				cursorMoveMonitor.removeEventListener();
				if (cursorMoveMonitor.movedCursorDistance() > 0.05) {
					console.error('DO NOT MOVE CURSOR WHILE TEST IS RUNNING');
				}
			});
		}
	);

	qUnit.test(
		'js/onObjectClick referring a different object should clear correctly if the actor node is not used anymore',
		async (assert) => {
			const scene = window.scene;
			const perspective_camera1 = window.perspective_camera1;

			perspective_camera1.p.t.set([0, 0, 5]);

			// geo nodes
			const geo1 = window.geo1;
			const geo2 = scene.root().createNode('geo');

			// setup
			function _setupGeo1(geo: GeoObjNode) {
				const box1 = geo.createNode('box');
				const objectProperties1 = geo.createNode('objectProperties');
				const actor1 = geo.createNode('actor');
				objectProperties1.setInput(0, box1);
				actor1.setInput(0, objectProperties1);
				objectProperties1.p.tname.set(true);
				objectProperties1.p.name.set('box');

				const onObjectClick1 = actor1.createNode('onObjectClick');
				const setParam1 = actor1.createNode('setParam');
				const getObject1 = actor1.createNode('getObject');

				setParam1.setInput(0, onObjectClick1);
				onObjectClick1.setInput(JsConnectionPointType.OBJECT_3D, getObject1);
				setParam1.setParamParam(geo2.p.scale);
				setParam1.setParamType(JsConnectionPointType.FLOAT);
				setParam1.params.get(SetParamJsNodeInputName.val)?.set(2);

				getObject1.p.getCurrentObject.set(false);
				getObject1.p.mask.set('*/sphere');

				return {objectProperties1, actor1};
			}
			const geo1Nodes = _setupGeo1(geo1);

			geo1Nodes.actor1.flags.display.set(true);

			const container1 = await geo1Nodes.actor1.compute();
			const object1 = container1.coreContent()!.threejsObjects()[0];

			assert.equal(object1.name, 'box');

			// wait to make sure objects are mounted to the scene
			await CoreSleep.sleep(150);

			const cursorMoveMonitor = new CursorMoveMonitor();
			cursorMoveMonitor.addPointermoveEventListener(scene.eventsDispatcher.pointerEventsController.cursor());

			await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
				const {viewer} = args;
				const canvas = viewer.canvas();
				scene.play();
				assert.equal(scene.time(), 0, 'time is 0');
				assert.equal(geo2.p.scale.value, 1, 'scale starts at 1');

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.LEFT);
				await CoreSleep.sleep(100);
				assert.equal(geo2.p.scale.value, 2, 'scale is now 2');

				const _objects: Object3D[] = [];
				scene.actorsManager.rayObjectIntersectionClick.objects(_objects);
				assert.equal(_objects.length, 1);
				assert.equal(_objects[0].uuid, object1.uuid);

				// now let's display the objectProperties node, so that the actor node isn't used anymore
				// and check that the ray click controller does not keep the object
				geo1Nodes.objectProperties1.flags.display.set(true);
				// const container2 = await geo1Nodes.objectProperties1.compute();
				// const object1b = container2.coreContent()!.threejsObjects()[0];
				await CoreSleep.sleep(100);

				scene.actorsManager.rayObjectIntersectionClick.objects(_objects);
				assert.equal(_objects.length, 0, '0 objects');

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.LEFT);
				await CoreSleep.sleep(100);
				assert.equal(geo2.p.scale.value, 2, 'still 2');

				cursorMoveMonitor.removeEventListener();
				if (cursorMoveMonitor.movedCursorDistance() > 0.05) {
					console.error('DO NOT MOVE CURSOR WHILE TEST IS RUNNING');
				}

				// and if we display the actor node back,
				// the events work as expected
				geo2.p.scale.set(1);
				geo1Nodes.actor1.flags.display.set(true);
				await CoreSleep.sleep(100);
				scene.actorsManager.rayObjectIntersectionClick.objects(_objects);
				assert.equal(_objects.length, 1, '1 object');
				assert.equal(_objects[0].uuid, object1.uuid);

				await triggerPointerdownAndPointerupInMiddle(canvas, MouseButton.LEFT);
				await CoreSleep.sleep(100);
				assert.equal(geo2.p.scale.value, 2, 'still 2');
			});
		}
	);
}
