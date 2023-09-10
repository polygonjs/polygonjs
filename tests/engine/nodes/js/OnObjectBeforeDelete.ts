import type {QUnit} from '../../../helpers/QUnit';
import {Mesh, Object3D} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {SetObjectAttributeInputName} from '../../../../src/engine/nodes/js/SetObjectAttribute';
import {CoreObject} from '../../../../src/core/geometry/modules/three/CoreObject';
import {ObjectEvent} from '../../../../src/core/geometry/Event';
export function testenginenodesjsOnObjectBeforeDelete(qUnit: QUnit) {
	qUnit.test('js/onObjectBeforeDelete simple', async (assert) => {
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
		const onObjectBeforeDelete1 = actor1.createNode('onObjectBeforeDelete');
		const getParent1 = actor1.createNode('getParent');
		const setObjectAttribute1 = actor1.createNode('setObjectAttribute');

		deleteObject1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
		setObjectAttribute1.setInput(JsConnectionPointType.TRIGGER, onObjectBeforeDelete1);
		setObjectAttribute1.setInput(JsConnectionPointType.OBJECT_3D, getParent1);
		setObjectAttribute1.setAttribName('childDeleted');
		setObjectAttribute1.setAttribType(JsConnectionPointType.BOOLEAN);
		setObjectAttribute1.params.get(SetObjectAttributeInputName.val)!.set(1);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(50);
		const parent = object.parent!;
		assert.ok(parent);

		const getChildDeleted = () => {
			return CoreObject.attribValue(parent, 'childDeleted', 0);
		};
		const onBeforeDeleteListeners = (object: Object3D) => {
			return (object as any)._listeners[ObjectEvent.BEFORE_DELETE] as Function[];
		};
		assert.equal(getChildDeleted(), undefined);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();

			assert.equal(onBeforeDeleteListeners(object).length, 1, '1 listener');

			assert.equal(scene.time(), 0);
			assert.ok(object.parent, 'object has a parent');
			assert.equal(parent.children.length, 1, '1 child');
			assert.equal(getChildDeleted(), undefined);

			onManualTrigger1.p.trigger.pressButton();
			await CoreSleep.sleep(100);
			assert.notOk(object.parent, 'object has no parent');
			assert.equal(parent.children.length, 0, '0 child');
			assert.equal(getChildDeleted(), 1);

			assert.equal(onBeforeDeleteListeners(object).length, 0, '0 listener');
		});
	});
}
