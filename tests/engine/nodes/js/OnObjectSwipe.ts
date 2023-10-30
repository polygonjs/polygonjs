import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {triggerPointerdownInMiddle, triggerPointerupInMiddle} from '../../../helpers/EventsHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Vector2} from 'three';
import {ANGLE_DEGREES} from '../../../../src/engine/scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsSwipeController';
import {InstanceSopNode} from '../../../../src/engine/nodes/sop/Instance';

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

interface TestOptions {
	assert: Assert;
	angle: number;
	offset1: Vector2;
	offset2: Vector2;
	gpu: boolean;
}

export function testenginenodesjsOnObjectSwipe(qUnit: QUnit) {
	async function _runTest(options: TestOptions) {
		const {assert} = options;
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;

		perspective_camera1.p.t.set([0, 0, 5]);

		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');
		const actor1 = geo1.createNode('actor');
		if (options.gpu) {
			const add1 = geo1.createNode('add');
			const instance1 = geo1.createNode('instance');
			createRequiredNodes(instance1);

			instance1.setInput(0, box1);
			instance1.setInput(1, add1);
			transform1.setInput(0, instance1);
			// material1.setInput(0, transform1);
			actor1.setInput(0, transform1);
		} else {
			transform1.setInput(0, box1);
			actor1.setInput(0, transform1);
		}

		const onObjectSwipe1 = options.gpu ? actor1.createNode('onObjectSwipeGPU') : actor1.createNode('onObjectSwipe');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const getObjectProperty1 = actor1.createNode('getObjectProperty');
		const negate1 = actor1.createNode('negate');

		onObjectSwipe1.p.angle.set(options.angle);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectSwipe1);
		// setObjectPosition1.p.position.set([0, 0, 1]);
		setObjectPosition1.setInput('position', negate1);
		negate1.setInput(0, getObjectProperty1);

		transform1.setApplyOn(TransformTargetType.OBJECT);
		transform1.p.t.set([0, 0, 0.5]);
		actor1.flags.display.set(true);

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

			triggerPointerdownInMiddle(canvas, options.offset1);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'pos same');

			triggerPointerupInMiddle(canvas, options.offset2);
			// we trigger an event on the canvas to update the pointerEventsController cursor,
			// and one on the document to trigger the pointerup of the RayObjectIntersectionsSwipeController
			triggerPointerupInMiddle(canvas, options.offset2, document);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'position negated');
		});
	}

	qUnit.test('js/onObjectSwipe left', async (assert) => {
		await _runTest({
			assert,
			angle: ANGLE_DEGREES.LEFT,
			offset1: new Vector2(2, 0),
			offset2: new Vector2(-2, 0),
			gpu: false,
		});
	});

	qUnit.test('js/onObjectSwipe left GPU', async (assert) => {
		await _runTest({
			assert,
			angle: ANGLE_DEGREES.LEFT,
			offset1: new Vector2(2, 0),
			offset2: new Vector2(-2, 0),
			gpu: true,
		});
	});

	qUnit.test('js/onObjectSwipe right', async (assert) => {
		await _runTest({
			assert,
			angle: ANGLE_DEGREES.RIGHT,
			offset1: new Vector2(-2, 0),
			offset2: new Vector2(2, 0),
			gpu: false,
		});
	});

	qUnit.test('js/onObjectSwipe right GPU', async (assert) => {
		await _runTest({
			assert,
			angle: ANGLE_DEGREES.RIGHT,
			offset1: new Vector2(-2, 0),
			offset2: new Vector2(2, 0),
			gpu: true,
		});
	});

	qUnit.test('js/onObjectSwipe down', async (assert) => {
		await _runTest({
			assert,
			angle: ANGLE_DEGREES.DOWN,
			offset1: new Vector2(0, -2),
			offset2: new Vector2(0, 2),
			gpu: false,
		});
	});

	qUnit.test('js/onObjectSwipe down GPU', async (assert) => {
		await _runTest({
			assert,
			angle: ANGLE_DEGREES.DOWN,
			offset1: new Vector2(0, -2),
			offset2: new Vector2(0, 2),
			gpu: true,
		});
	});

	qUnit.test('js/onObjectSwipe up', async (assert) => {
		await _runTest({
			assert,
			angle: ANGLE_DEGREES.UP,
			offset1: new Vector2(0, 2),
			offset2: new Vector2(0, -2),
			gpu: false,
		});
	});

	qUnit.test('js/onObjectSwipe up GPU', async (assert) => {
		await _runTest({
			assert,
			angle: ANGLE_DEGREES.UP,
			offset1: new Vector2(0, 2),
			offset2: new Vector2(0, -2),
			gpu: true,
		});
	});
}
