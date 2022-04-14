import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {CoreSleep} from '../../../../src/core/Sleep';
import {SetObjectAttributeActorNode} from '../../../../src/engine/nodes/actor/SetObjectAttribute';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

function triggerPointerdownInMiddle(canvas: HTMLCanvasElement) {
	const rect = canvas.getBoundingClientRect();
	canvas.dispatchEvent(
		new PointerEvent('pointerdown', {clientX: rect.left + rect.width * 0.5, clientY: rect.top + rect.height * 0.5})
	);
}
function triggerPointerdownAside(canvas: HTMLCanvasElement) {
	canvas.dispatchEvent(new PointerEvent('pointerdown', {clientX: 0, clientY: 0}));
}

QUnit.test('actor/setObjectAttribute', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	perspective_camera1.p.t.set([0, 0, 5]);

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('increment');
	const actor1 = geo1.createNode('actor');

	attribCreate1.setInput(0, box1);
	actor1.setInput(0, attribCreate1);
	actor1.flags.display.set(true);

	const onObjectClick1 = actor1.createNode('onObjectClick');
	const setObjectAttribute1 = actor1.createNode('setObjectAttribute');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const add1 = actor1.createNode('add');

	setObjectAttribute1.setInput(ActorConnectionPointType.TRIGGER, onObjectClick1);
	setObjectAttribute1.setAttribType(ActorConnectionPointType.INTEGER);
	setObjectAttribute1.p.attribName.set('increment');
	setObjectAttribute1.setInput(SetObjectAttributeActorNode.INPUT_NAME_VAL, add1);

	getObjectAttribute1.setAttribType(ActorConnectionPointType.INTEGER);
	getObjectAttribute1.p.attribName.set('increment');

	add1.setInput(0, getObjectAttribute1);
	add1.params.get('add1')!.set(1);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];
	const coreObject = new CoreObject(object, 0);

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		const {viewer} = args;
		const canvas = viewer.canvas();
		scene.play();
		assert.equal(scene.time(), 0);

		assert.equal(coreObject.attribValue('increment'), 0);

		triggerPointerdownInMiddle(canvas);
		await CoreSleep.sleep(100);
		assert.equal(coreObject.attribValue('increment'), 1);

		triggerPointerdownAside(canvas);
		await CoreSleep.sleep(100);
		assert.equal(coreObject.attribValue('increment'), 1);

		triggerPointerdownInMiddle(canvas);
		await CoreSleep.sleep(100);
		assert.equal(coreObject.attribValue('increment'), 2);
	});
});
