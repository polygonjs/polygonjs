import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {GetIntersectionPropertyJsNodeOutputName} from '../../../../src/engine/nodes/js/GetIntersectionProperty';
import {SetParamJsNodeInputName} from '../../../../src/engine/nodes/js/SetParam';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {triggerPointerdownAside, triggerPointerdownInMiddle, triggerPointerdown} from '../../../helpers/EventsHelper';
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

export function testenginenodesjsOnObjectPointerdown(qUnit: QUnit) {
	qUnit.test('js/onObjectPointerdown simple', async (assert) => {
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
		actor1.io.inputs.overrideClonedState(true);

		const onObjectPointerdown1 = actor1.createNode('onObjectPointerdown');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const getObjectProperty1 = actor1.createNode('getObjectProperty');
		const negate1 = actor1.createNode('negate');
		const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
		const setParam1 = actor1.createNode('setParam');

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectPointerdown1);
		// setObjectPosition1.p.position.set([0, 0, 1]);
		setObjectPosition1.setInput('position', negate1);
		negate1.setInput(0, getObjectProperty1);
		//
		getIntersectionProperty1.setInput(0, onObjectPointerdown1, JsConnectionPointType.INTERSECTION);
		setParam1.setInput(JsConnectionPointType.TRIGGER, onObjectPointerdown1);
		setParam1.setInput(
			SetParamJsNodeInputName.val,
			getIntersectionProperty1,
			GetIntersectionPropertyJsNodeOutputName.distance
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
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos set');
			assert.in_delta(geo2.p.scale.value, 4, 0.0001, 'scale');

			triggerPointerdownAside(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'position unset');
			assert.in_delta(geo2.p.scale.value, 4, 0.0001, 'scale');

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'pos set');
			assert.in_delta(geo2.p.scale.value, 5, 0.0001, 'scale');

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
			triggerPointerdown(canvas, {x: 0.01, y: 0.01});
			await CoreSleep.sleep(200);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5]);
			const tmpV3 = geo2.p.s.value.toArray();

			assert.in_delta(tmpV3[0], 0.0373046126523999, 0.001, 's');
			assert.in_delta(tmpV3[1], -0.03730461265239991, 0.001, 's');
			assert.in_delta(tmpV3[2], 1, 0.001, 's');
			object.position.set(0, 0, 0);

			// test intersection: uv
			// scene.batchUpdates(() => {
			setParam1.setInput(
				SetParamJsNodeInputName.val,
				getIntersectionProperty1,
				GetIntersectionPropertyJsNodeOutputName.uv
			);
			setParam1.setParamType(JsConnectionPointType.VECTOR2);
			await CoreSleep.sleep(50);
			setParam1.setParamParam(sphere1.p.resolution);
			// });
			await CoreSleep.sleep(100);
			triggerPointerdown(canvas, {x: 0.01, y: 0.01});
			await CoreSleep.sleep(200);
			assert.deepEqual(object.position.toArray(), [0, 0, 0]);
			const tmpV2 = sphere1.p.resolution.value.toArray();
			assert.in_delta(tmpV2[0], 0.5466307658154999, 0.001, 'uv');
			assert.in_delta(tmpV2[1], 0.4533692341845001, 0.001, 'uv');
			object.position.set(0, 0, 0);
		});
	});

	qUnit.test('js/onObjectPointerdown with occluded objects', async (assert) => {
		const scene = window.scene;
		const MAT = window.MAT;
		const perspective_camera1 = window.perspective_camera1;

		perspective_camera1.p.t.set([0, 0, 5]);

		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const box2 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');
		const transform2 = geo1.createNode('transform');
		const material1 = geo1.createNode('material');
		const material2 = geo1.createNode('material');
		const merge1 = geo1.createNode('merge');
		const actor1 = geo1.createNode('actor');
		//
		const geo2 = scene.root().createNode('geo');
		// const sphere1 = geo2.createNode('sphere');

		const meshBasic1 = MAT.createNode('meshBasic');
		meshBasic1.p.color.set([1, 0, 0]);
		material1.p.material.setNode(meshBasic1);
		const meshBasic2 = MAT.createNode('meshBasic');
		meshBasic2.p.color.set([0, 1, 0]);
		material2.p.material.setNode(meshBasic2);

		transform1.setApplyOn(TransformTargetType.OBJECT);
		transform1.p.t.set([0, 0, 0.5]);
		transform2.setApplyOn(TransformTargetType.OBJECT);
		transform2.p.t.set([0, 0, -1.5]);

		actor1.setInput(0, merge1);
		merge1.setInput(0, material1);
		merge1.setInput(1, material2);
		material1.setInput(0, transform1);
		material2.setInput(0, transform2);
		transform1.setInput(0, box1);
		transform2.setInput(0, box2);
		actor1.flags.display.set(true);
		actor1.io.inputs.overrideClonedState(true);

		const onObjectPointerdown1 = actor1.createNode('onObjectPointerdown');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const getObjectProperty1 = actor1.createNode('getObjectProperty');
		const negate1 = actor1.createNode('negate');
		const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
		const setParam1 = actor1.createNode('setParam');

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectPointerdown1);
		// setObjectPosition1.p.position.set([0, 0, 1]);
		setObjectPosition1.setInput('position', negate1);
		negate1.setInput(0, getObjectProperty1);
		//
		getIntersectionProperty1.setInput(0, onObjectPointerdown1, JsConnectionPointType.INTERSECTION);
		setParam1.setInput(JsConnectionPointType.TRIGGER, onObjectPointerdown1);
		setParam1.setInput(
			SetParamJsNodeInputName.val,
			getIntersectionProperty1,
			GetIntersectionPropertyJsNodeOutputName.distance
		);
		setParam1.setParamType(JsConnectionPointType.FLOAT);
		setParam1.setParamParam(geo2.p.scale);

		onObjectPointerdown1.p.blockObjectsBehind.set(false);

		const container = await actor1.compute();
		const object1 = container.coreContent()!.threejsObjects()[0];
		const object2 = container.coreContent()!.threejsObjects()[1];
		assert.equal(object1.name, 'box1');
		assert.equal(object2.name, 'box2');

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			const {viewer} = args;
			const canvas = viewer.canvas();
			scene.play();
			assert.equal(scene.time(), 0);
			assert.deepEqual(object1.position.toArray(), [0, 0, 0.5], 'position 0 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, -1.5], 'position 0 2');
			assert.equal(geo2.p.scale.value, 1, 'scale');

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object1.position.toArray(), [0, 0, -0.5], 'pos set 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, 1.5], 'pos set 2');
			assert.in_delta(geo2.p.scale.value, 6, 0.0001, 'scale');

			onObjectPointerdown1.p.blockObjectsBehind.set(true);
			await CoreSleep.sleep(100);
			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object1.position.toArray(), [0, 0, -0.5], 'pos set 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, -1.5], 'pos set 2');
			assert.in_delta(geo2.p.scale.value, 3, 0.0001, 'scale');

			triggerPointerdownAside(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object1.position.toArray(), [0, 0, -0.5], 'position unset 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, -1.5], 'pos set 2');
			assert.in_delta(geo2.p.scale.value, 3, 0.0001, 'scale');

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object1.position.toArray(), [0, 0, 0.5], 'pos set 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, -1.5], 'pos set 2');
			assert.in_delta(geo2.p.scale.value, 5, 0.0001, 'scale');
		});
	});

	qUnit.test('js/onObjectPointerdown can sort cpu and gpu intersections', async (assert) => {
		const scene = window.scene;
		const MAT = window.MAT;
		const perspective_camera1 = window.perspective_camera1;

		perspective_camera1.p.t.set([0, 0, 5]);

		const geo1 = window.geo1;

		// const material2 = geo1.createNode('material');

		//
		const geo2 = scene.root().createNode('geo');
		// const sphere1 = geo2.createNode('sphere');

		// material2.p.material.setNode(meshBasic2);

		// setup box
		const _setupBox1 = () => {
			const box1 = geo1.createNode('box');
			const transform1 = geo1.createNode('transform');
			const actor1 = geo1.createNode('actor');
			const material1 = geo1.createNode('material');

			transform1.setInput(0, box1);
			material1.setInput(0, transform1);
			actor1.setInput(0, material1);
			const meshBasic1 = MAT.createNode('meshBasic');
			meshBasic1.p.color.set([1, 0, 0]);
			material1.p.material.setNode(meshBasic1);
			// actor1
			const _setupActor1 = () => {
				const onObjectPointerdown1 = actor1.createNode('onObjectPointerdown');
				const setObjectPosition1 = actor1.createNode('setObjectPosition');
				const getObjectProperty1 = actor1.createNode('getObjectProperty');
				const negate1 = actor1.createNode('negate');
				const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
				const setParam1 = actor1.createNode('setParam');

				setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectPointerdown1);
				// setObjectPosition1.p.position.set([0, 0, 1]);
				setObjectPosition1.setInput('position', negate1);
				negate1.setInput(0, getObjectProperty1);
				//
				getIntersectionProperty1.setInput(0, onObjectPointerdown1, JsConnectionPointType.INTERSECTION);
				setParam1.setInput(JsConnectionPointType.TRIGGER, onObjectPointerdown1);
				setParam1.setInput(
					SetParamJsNodeInputName.val,
					getIntersectionProperty1,
					GetIntersectionPropertyJsNodeOutputName.distance
				);
				setParam1.setParamType(JsConnectionPointType.FLOAT);
				setParam1.setParamParam(geo2.p.scale);
				return {onObjectPointerdown1};
			};
			const {onObjectPointerdown1} = _setupActor1();

			return {actor1, transform1, onObjectPointerdown1};
		};

		// setup instance
		const _setupInstance = () => {
			const box2 = geo1.createNode('box');
			const add1 = geo1.createNode('add');
			const transform2 = geo1.createNode('transform');
			const objectProperties2 = geo1.createNode('objectProperties');
			const instance1 = geo1.createNode('instance');
			const actor2 = geo1.createNode('actor');

			instance1.setInput(0, box2);
			instance1.setInput(1, add1);
			createRequiredNodes(instance1);
			objectProperties2.setInput(0, instance1);
			transform2.setInput(0, objectProperties2);
			actor2.setInput(0, transform2);

			objectProperties2.p.tname.set(true);
			objectProperties2.p.name.set('box2');

			// actor2
			const _setupActor2 = () => {
				const onObjectPointerdownGPU1 = actor2.createNode('onObjectPointerdownGPU');
				const setObjectPosition2 = actor2.createNode('setObjectPosition');
				const getObjectProperty2 = actor2.createNode('getObjectProperty');
				const negate2 = actor2.createNode('negate');
				const setParam2 = actor2.createNode('setParam');

				setObjectPosition2.setInput(JsConnectionPointType.TRIGGER, onObjectPointerdownGPU1);
				// setObjectPosition1.p.position.set([0, 0, 1]);
				setObjectPosition2.setInput('position', negate2);
				negate2.setInput(0, getObjectProperty2);
				//
				setParam2.setInput(JsConnectionPointType.TRIGGER, onObjectPointerdownGPU1);
				setParam2.setInput(
					SetParamJsNodeInputName.val,
					onObjectPointerdownGPU1,
					OnObjectPointerEventGPUJsNodeOutputName.distance
				);
				setParam2.setParamType(JsConnectionPointType.FLOAT);
				setParam2.setParamParam(geo2.p.scale);
				return {onObjectPointerdownGPU1};
			};
			const {onObjectPointerdownGPU1} = _setupActor2();

			return {actor2, transform2, onObjectPointerdownGPU1};
		};

		const {actor1, transform1, onObjectPointerdown1} = _setupBox1();
		const {actor2, transform2, onObjectPointerdownGPU1} = _setupInstance();

		// merge
		const merge1 = geo1.createNode('merge');
		merge1.setInput(0, actor1);
		merge1.setInput(1, actor2);
		merge1.flags.display.set(true);
		actor1.io.inputs.overrideClonedState(true);
		actor2.io.inputs.overrideClonedState(true);
		merge1.io.inputs.overrideClonedState(true);

		// setup transforms
		transform1.setApplyOn(TransformTargetType.OBJECT);
		transform1.p.t.set([0, 0, 0.5]);
		transform2.setApplyOn(TransformTargetType.OBJECT);
		transform2.p.t.set([0, 0, -1.5]);

		//
		onObjectPointerdown1.p.blockObjectsBehind.set(false);
		onObjectPointerdownGPU1.p.blockObjectsBehind.set(false);

		const container = await merge1.compute();
		const object1 = container.coreContent()!.threejsObjects()[0];
		const object2 = container.coreContent()!.threejsObjects()[1];
		assert.equal(object1.name, 'box1');
		assert.equal(object2.name, 'box2');

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			const {viewer} = args;
			const canvas = viewer.canvas();
			scene.play();
			assert.equal(scene.time(), 0);
			assert.deepEqual(object1.position.toArray(), [0, 0, 0.5], 'position 0 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, -1.5], 'position 0 2');
			assert.equal(geo2.p.scale.value, 1, 'scale');

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object1.position.toArray(), [0, 0, -0.5], 'pos set 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, 1.5], 'pos set 2');
			assert.in_delta(geo2.p.scale.value, 6, 0.0001, 'scale');

			onObjectPointerdown1.p.blockObjectsBehind.set(true);
			onObjectPointerdownGPU1.p.blockObjectsBehind.set(true);
			await CoreSleep.sleep(100);
			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object1.position.toArray(), [0, 0, -0.5], 'pos set 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, -1.5], 'pos set 2');
			assert.in_delta(geo2.p.scale.value, 3, 0.0001, 'scale');

			triggerPointerdownAside(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object1.position.toArray(), [0, 0, -0.5], 'position unset 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, -1.5], 'pos set 2');
			assert.in_delta(geo2.p.scale.value, 3, 0.0001, 'scale');

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object1.position.toArray(), [0, 0, 0.5], 'pos set 1');
			assert.deepEqual(object2.position.toArray(), [0, 0, -1.5], 'pos set 2');
			assert.in_delta(geo2.p.scale.value, 5, 0.0001, 'scale');
		});
	});
}
