import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {CoreSleep} from '../../../../src/core/Sleep';
import {SetObjectAttributeJsNode} from '../../../../src/engine/nodes/js/SetObjectAttribute';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {triggerClickAside, triggerClickInMiddle} from '../../../helpers/EventsHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/setObjectAttribute', async (assert) => {
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
	actor1.io.inputs.overrideClonedState(true);

	const onObjectClick1 = actor1.createNode('onObjectClick');
	const setObjectAttribute1 = actor1.createNode('setObjectAttribute');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const add1 = actor1.createNode('add');

	setObjectAttribute1.setInput(JsConnectionPointType.TRIGGER, onObjectClick1);
	setObjectAttribute1.setAttribType(JsConnectionPointType.INT);
	setObjectAttribute1.setAttribName('increment');
	setObjectAttribute1.setInput(SetObjectAttributeJsNode.INPUT_NAME_VAL, add1);

	getObjectAttribute1.setAttribType(JsConnectionPointType.INT);
	getObjectAttribute1.setAttribName('increment');

	add1.setInput(0, getObjectAttribute1);
	add1.params.get('add1')!.set(1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];
	const coreObject = new CoreObject(object, 0);

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		const {viewer} = args;
		perspective_camera1.object.updateProjectionMatrix();
		assert.ok(viewer, 'viewer exists');
		const canvas = viewer.canvas();
		scene.play();
		assert.equal(scene.time(), 0);

		assert.equal(coreObject.attribValue('increment'), 0);

		triggerClickInMiddle(canvas);
		await CoreSleep.sleep(100);
		assert.equal(coreObject.attribValue('increment'), 1);

		triggerClickAside(canvas);
		await CoreSleep.sleep(100);
		assert.equal(coreObject.attribValue('increment'), 1);

		triggerClickInMiddle(canvas);
		await CoreSleep.sleep(100);
		assert.equal(coreObject.attribValue('increment'), 2);
	});
});
