import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {SetObjectAttributeInputName} from '../../../../src/engine/nodes/js/SetObjectAttribute';
import {GetChildrenPropertiesJsNodeOutputName} from '../../../../src/engine/nodes/js/GetChildrenProperties';
import {CoreObject} from '../../../../src/core/geometry/Object';

QUnit.test('js/deleteObject simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const deleteObject1 = actor1.createNode('deleteObject');

	deleteObject1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(50);
	const parent = object.parent!;
	assert.ok(parent);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.ok(object.parent, 'object has a parent');
		assert.equal(parent.children.length, 1, '1 child');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.notOk(object.parent, 'object has no parent');
		assert.equal(parent.children.length, 0, '0 child');
	});
});

QUnit.test('js/deleteObject with hierarchy reactivity', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const copy1 = geo1.createNode('copy');
	const hierarchy1 = geo1.createNode('hierarchy');
	const actor1 = geo1.createNode('actor');

	copy1.setInput(0, box1);
	hierarchy1.setInput(0, copy1);
	actor1.setInput(0, hierarchy1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	copy1.p.count.set(4);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const deleteObject1 = actor1.createNode('deleteObject');
	const getObjectChild1 = actor1.createNode('getObjectChild');
	const getChildrenProperties1 = actor1.createNode('getChildrenProperties');
	const arrayLength1 = actor1.createNode('arrayLength');
	const setObjectAttribute1 = actor1.createNode('setObjectAttribute');

	deleteObject1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	deleteObject1.setInput(JsConnectionPointType.OBJECT_3D, getObjectChild1);

	setObjectAttribute1.setInput(JsConnectionPointType.TRIGGER, deleteObject1);
	setObjectAttribute1.setAttribName('childrenCount');
	setObjectAttribute1.setInput(SetObjectAttributeInputName.val, arrayLength1);
	arrayLength1.setInput(0, getChildrenProperties1, GetChildrenPropertiesJsNodeOutputName.visible);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	const getChildrenCount = () => {
		return CoreObject.attribValue(object, 'childrenCount', 0);
	};

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(50);
	assert.equal(object.children.length, 4, '4 children');
	assert.equal(getChildrenCount(), undefined);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.children.length, 4, '4 children');
		assert.equal(getChildrenCount(), undefined);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.children.length, 3, '3 children');
		assert.equal(getChildrenCount(), 3);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.children.length, 2, '2 children');
		assert.equal(getChildrenCount(), 2);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.children.length, 1, '1 child');
		assert.equal(getChildrenCount(), 1);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.children.length, 0, '0 children');
		assert.equal(getChildrenCount(), 0);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.children.length, 0, '0 children');
		assert.equal(getChildrenCount(), 0);
	});
});
