// import {CoreObject} from '../../../../src/core/geometry/modules/three/CoreObject';
// import {CoreSleep} from '../../../../src/core/Sleep';
// import {OnEventObjectAttributeUpdatedActorNode} from '../../../../src/engine/nodes/actor/OnEventObjectAttributeUpdated';
// import {TwoWaySwitchActorNodeInputName} from '../../../../src/engine/nodes/actor/TwoWaySwitch';
// import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
// import {RendererUtils} from '../../../helpers/RendererUtils';

// function triggerPointerMoveInMiddle(canvas: HTMLCanvasElement) {
// 	const rect = canvas.getBoundingClientRect();
// 	canvas.dispatchEvent(
// 		new PointerEvent('pointermove', {clientX: rect.left + rect.width * 0.5, clientY: rect.top + rect.height * 0.5})
// 	);
// }
// function triggerPointerMoveAside(canvas: HTMLCanvasElement) {
// 	canvas.dispatchEvent(new PointerEvent('pointermove', {clientX: 0, clientY: 0}));
// }

// QUnit.test(
// 	'js/setObjectHoveredState creation and deletion has a pointermove event added/removed without the need to have a event/pointermove node',
// 	async (assert) => {
// 		const scene = window.scene;
// 		const perspective_camera1 = window.perspective_camera1;

// 		perspective_camera1.p.t.set([0, 0, 5]);

// 		const geo1 = window.geo1;
// 		const box1 = geo1.createNode('box');
// 		const actor1 = geo1.createNode('actor');

// 		actor1.setInput(0, box1);
// 		actor1.flags.display.set(true);

// 		const onEventTick1 = actor1.createNode('onEventTick');
// 		const setObjectHoveredState1 = actor1.createNode('setObjectHoveredState');
// 		const onEventObjectAttributeUpdated1 = actor1.createNode('onEventObjectAttributeUpdated');
// 		const setObjectScale1 = actor1.createNode('setObjectScale');
// 		const twoWaySwitch1 = actor1.createNode('twoWaySwitch');

// 		setObjectHoveredState1.setInput(JsConnectionPointType.TRIGGER, onEventTick1);
// 		setObjectScale1.setInput(JsConnectionPointType.TRIGGER, onEventObjectAttributeUpdated1);

// 		onEventObjectAttributeUpdated1.p.attribName.set('hovered');
// 		onEventObjectAttributeUpdated1.setAttribType(JsConnectionPointType.BOOLEAN);
// 		setObjectScale1.setInput('mult', twoWaySwitch1);

// 		twoWaySwitch1.setInput(
// 			TwoWaySwitchActorNodeInputName.CONDITION,
// 			onEventObjectAttributeUpdated1,
// 			OnEventObjectAttributeUpdatedActorNode.OUTPUT_NEW_VAL
// 		);
// 		twoWaySwitch1.params.get('ifTrue')!.set(1.2);
// 		twoWaySwitch1.params.get('ifFalse')!.set(1);

// 		const container = await actor1.compute();
// 		const object = container.coreContent()!.threejsObjects()[0];
// 		const coreObject = new CoreObject(object, 0);

// 		// wait to make sure objects are mounted to the scene
// 		await CoreSleep.sleep(150);

// 		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
// 			const {viewer} = args;
// 			const canvas = viewer.canvas();
// 			scene.play();
// 			assert.equal(scene.time(), 0);

// 			assert.deepEqual(object.scale.toArray(), [1, 1, 1]);
// 			assert.equal(coreObject.attribValue('hovered'), false);

// 			triggerPointerMoveInMiddle(canvas);
// 			await CoreSleep.sleep(200);
// 			assert.deepEqual(object.scale.toArray(), [1.2, 1.2, 1.2]);
// 			assert.equal(coreObject.attribValue('hovered'), true);

// 			triggerPointerMoveAside(canvas);
// 			await CoreSleep.sleep(200);
// 			assert.deepEqual(object.scale.toArray(), [1, 1, 1]);
// 			assert.equal(coreObject.attribValue('hovered'), false);
// 		});
// 	}
// );
