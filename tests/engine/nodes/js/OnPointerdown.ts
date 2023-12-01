import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {triggerPointerdownInMiddle} from '../../../helpers/EventsHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreEventEmitter} from '../../../../src/core/event/CoreEventEmitter';
export function testenginenodesjsOnPointerdown(qUnit: QUnit) {
	qUnit.test('js/onPointerdown simple', async (assert) => {
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

		const onPointerdown1 = actor1.createNode('onPointerdown');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const getObjectProperty1 = actor1.createNode('getObjectProperty');
		const negate1 = actor1.createNode('negate');

		onPointerdown1.setEventEmitter(CoreEventEmitter.CANVAS);
		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onPointerdown1);
		// setObjectPosition1.p.position.set([0, 0, 1]);
		setObjectPosition1.setInput('position', negate1);
		negate1.setInput(0, getObjectProperty1);
		//

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

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(100);
			assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos set');
		});
	});
}
