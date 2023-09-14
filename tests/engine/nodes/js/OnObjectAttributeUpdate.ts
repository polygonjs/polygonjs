import type {QUnit} from '../../../helpers/QUnit';
import {Mesh, Vector2, Vector3, Vector4} from 'three';
import {AttribClass, AttribType} from '../../../../src/core/geometry/Constant';
import {ThreejsObject} from '../../../../src/core/geometry/modules/three/ThreejsObject';
import {CoreSleep} from '../../../../src/core/Sleep';
import {OnObjectAttributeUpdateJsNode} from '../../../../src/engine/nodes/js/OnObjectAttributeUpdate';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
export function testenginenodesjsOnObjectAttributeUpdate(qUnit: QUnit) {
	qUnit.test('js/onObjectAttributeUpdate with number', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const attributeCreate1 = geo1.createNode('attribCreate');
		const actor1 = geo1.createNode('actor');

		attributeCreate1.setAttribClass(AttribClass.OBJECT);
		attributeCreate1.p.name.set('height');

		attributeCreate1.setInput(0, box1);
		actor1.setInput(0, attributeCreate1);
		actor1.flags.display.set(true);

		const onObjectAttributeUpdate1 = actor1.createNode('onObjectAttributeUpdate');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const floatToVec3_1 = actor1.createNode('floatToVec3');
		const getObjectAttribute1 = actor1.createNode('getObjectAttribute');

		onObjectAttributeUpdate1.setAttribName('height');

		getObjectAttribute1.setAttribName('height');
		getObjectAttribute1.setAttribType(JsConnectionPointType.FLOAT);

		floatToVec3_1.setInput(1, getObjectAttribute1);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectAttributeUpdate1);
		setObjectPosition1.setInput('position', floatToVec3_1);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			assert.equal(scene.time(), 0);
			assert.equal(object.position.y, 0);
			await CoreSleep.sleep(500);
			assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
			assert.equal(object.position.y, 0, 'object still at 0');

			new ThreejsObject(object, 0).setAttribValue('height', 1);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, 1, 'object moved to 1');

			new ThreejsObject(object, 0).setAttribValue('height', 0.5);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, 0.5, 'object moved to 0.5');
		});
	});

	qUnit.test('js/onObjectAttributeUpdate with string', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const attributeCreate1 = geo1.createNode('attribCreate');
		const actor1 = geo1.createNode('actor');

		attributeCreate1.setAttribClass(AttribClass.OBJECT);
		attributeCreate1.setAttribType(AttribType.STRING);
		attributeCreate1.p.name.set('height');

		attributeCreate1.setInput(0, box1);
		actor1.setInput(0, attributeCreate1);
		actor1.flags.display.set(true);

		const onObjectAttributeUpdate1 = actor1.createNode('onObjectAttributeUpdate');
		const setObjectAttribute1 = actor1.createNode('setObjectAttribute');
		const getObjectAttribute1 = actor1.createNode('getObjectAttribute');

		onObjectAttributeUpdate1.setAttribName('height');

		getObjectAttribute1.setAttribName('height');
		getObjectAttribute1.setAttribType(JsConnectionPointType.STRING);

		setObjectAttribute1.setAttribName('height2');
		setObjectAttribute1.setInput(JsConnectionPointType.TRIGGER, onObjectAttributeUpdate1);
		setObjectAttribute1.setInput('val', getObjectAttribute1);
		setObjectAttribute1.setAttribType(JsConnectionPointType.STRING);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			assert.equal(scene.time(), 0);
			assert.notOk(ThreejsObject.attribValue(object, 'height2'));
			await CoreSleep.sleep(500);
			assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
			assert.notOk(ThreejsObject.attribValue(object, 'height2'));

			new ThreejsObject(object, 0).setAttribValue('height', 'hahah');
			await CoreSleep.sleep(100);
			assert.equal(ThreejsObject.attribValue(object, 'height2'), 'hahah', 'attrib changed');

			new ThreejsObject(object, 0).setAttribValue('height', 'hu');
			await CoreSleep.sleep(100);
			assert.equal(ThreejsObject.attribValue(object, 'height2'), 'hu', 'attrib changed');
		});
	});

	qUnit.test('js/onObjectAttributeUpdate with vector2', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const attributeCreate1 = geo1.createNode('attribCreate');
		const actor1 = geo1.createNode('actor');

		attributeCreate1.setAttribClass(AttribClass.OBJECT);
		attributeCreate1.p.name.set('statePos');
		attributeCreate1.p.size.set(2);

		attributeCreate1.setInput(0, box1);
		actor1.setInput(0, attributeCreate1);
		actor1.flags.display.set(true);

		const onObjectAttributeUpdate1 = actor1.createNode('onObjectAttributeUpdate');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const floatToVec3_1 = actor1.createNode('floatToVec3');
		const vec2ToFloat_1 = actor1.createNode('vec2ToFloat');

		onObjectAttributeUpdate1.setAttribName('statePos');
		onObjectAttributeUpdate1.setAttribType(JsConnectionPointType.VECTOR2);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectAttributeUpdate1);
		setObjectPosition1.setInput('position', floatToVec3_1);

		floatToVec3_1.setInput(0, vec2ToFloat_1, 'x');
		floatToVec3_1.setInput(1, vec2ToFloat_1, 'y');
		vec2ToFloat_1.setInput(0, onObjectAttributeUpdate1, OnObjectAttributeUpdateJsNode.OUTPUT_NEW_VAL);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			assert.equal(scene.time(), 0);
			assert.equal(object.position.y, 0);
			await CoreSleep.sleep(500);
			assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
			assert.equal(object.position.y, 0, 'object still at 0');

			new ThreejsObject(object, 0).setAttribValue('statePos', new Vector2(3, 8));
			await CoreSleep.sleep(100);
			assert.equal(object.position.x, 3, 'object moved to 3');
			assert.equal(object.position.y, 8, 'object moved to 1');
			assert.equal(object.position.z, 0, 'object moved to 0');

			new ThreejsObject(object, 0).setAttribValue('statePos', new Vector2(5, 0.5));
			await CoreSleep.sleep(100);
			assert.equal(object.position.x, 5, 'object moved to 0.5');
			assert.equal(object.position.y, 0.5, 'object moved to 0.5');
			assert.equal(object.position.z, 0, 'object moved to 0');
		});
	});

	qUnit.test('js/onObjectAttributeUpdate with vector3', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const attributeCreate1 = geo1.createNode('attribCreate');
		const actor1 = geo1.createNode('actor');

		attributeCreate1.setAttribClass(AttribClass.OBJECT);
		attributeCreate1.p.name.set('statePos');
		attributeCreate1.p.size.set(3);

		attributeCreate1.setInput(0, box1);
		actor1.setInput(0, attributeCreate1);
		actor1.flags.display.set(true);

		const onObjectAttributeUpdate1 = actor1.createNode('onObjectAttributeUpdate');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');

		onObjectAttributeUpdate1.setAttribName('statePos');
		onObjectAttributeUpdate1.setAttribType(JsConnectionPointType.VECTOR3);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectAttributeUpdate1);
		setObjectPosition1.setInput('position', onObjectAttributeUpdate1, OnObjectAttributeUpdateJsNode.OUTPUT_NEW_VAL);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			assert.equal(scene.time(), 0);
			assert.equal(object.position.y, 0);
			await CoreSleep.sleep(500);
			assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
			assert.equal(object.position.y, 0, 'object still at 0');

			new ThreejsObject(object, 0).setAttribValue('statePos', new Vector3(3, 1, 2));
			await CoreSleep.sleep(100);
			assert.equal(object.position.x, 3, 'object moved to 1');
			assert.equal(object.position.y, 1, 'object moved to 1');
			assert.equal(object.position.z, 2, 'object moved to 1');

			new ThreejsObject(object, 0).setAttribValue('statePos', new Vector3(5, 0.5, 2.5));
			await CoreSleep.sleep(100);
			assert.equal(object.position.x, 5, 'object moved to 0.5');
			assert.equal(object.position.y, 0.5, 'object moved to 0.5');
			assert.equal(object.position.z, 2.5, 'object moved to 0.5');
		});
	});

	qUnit.test('js/onObjectAttributeUpdate with vector4', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const attributeCreate1 = geo1.createNode('attribCreate');
		const actor1 = geo1.createNode('actor');

		attributeCreate1.setAttribClass(AttribClass.OBJECT);
		attributeCreate1.p.name.set('statePos');
		attributeCreate1.p.size.set(4);

		attributeCreate1.setInput(0, box1);
		actor1.setInput(0, attributeCreate1);
		actor1.flags.display.set(true);

		const onObjectAttributeUpdate1 = actor1.createNode('onObjectAttributeUpdate');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const floatToVec3_1 = actor1.createNode('floatToVec3');
		const vec4ToFloat_1 = actor1.createNode('vec4ToFloat');

		onObjectAttributeUpdate1.setAttribName('statePos');
		onObjectAttributeUpdate1.setAttribType(JsConnectionPointType.VECTOR4);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectAttributeUpdate1);
		setObjectPosition1.setInput('position', floatToVec3_1);

		floatToVec3_1.setInput(0, vec4ToFloat_1, 'x');
		floatToVec3_1.setInput(1, vec4ToFloat_1, 'y');
		floatToVec3_1.setInput(2, vec4ToFloat_1, 'z');
		vec4ToFloat_1.setInput(0, onObjectAttributeUpdate1, OnObjectAttributeUpdateJsNode.OUTPUT_NEW_VAL);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			assert.equal(scene.time(), 0);
			assert.equal(object.position.y, 0);
			await CoreSleep.sleep(500);
			assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
			assert.equal(object.position.y, 0, 'object still at 0');

			new ThreejsObject(object, 0).setAttribValue('statePos', new Vector4(3, 1, 7, 12));
			await CoreSleep.sleep(100);
			assert.equal(object.position.x, 3, 'object moved to 1');
			assert.equal(object.position.y, 1, 'object moved to 1');
			assert.equal(object.position.z, 7, 'object moved to 1');

			new ThreejsObject(object, 0).setAttribValue('statePos', new Vector4(5, 0.5, 8, 41));
			await CoreSleep.sleep(100);
			assert.equal(object.position.x, 5, 'object moved to 0.5');
			assert.equal(object.position.y, 0.5, 'object moved to 0.5');
			assert.equal(object.position.z, 8, 'object moved to 0.5');
		});
	});

	qUnit.test(
		'js/onObjectAttributeUpdate generates correct code when only connected with its trigger output and no other output',
		async (assert) => {
			const scene = window.scene;
			const perspective_camera1 = window.perspective_camera1;
			const geo1 = window.geo1;
			const box1 = geo1.createNode('box');
			const hierarchy1 = geo1.createNode('hierarchy');
			const attributeCreate1 = geo1.createNode('attribCreate');
			const actor1 = geo1.createNode('actor');

			attributeCreate1.setAttribClass(AttribClass.OBJECT);
			attributeCreate1.p.name.set('height');

			actor1.setInput(0, box1);
			hierarchy1.setInput(0, actor1);
			attributeCreate1.setInput(0, hierarchy1);

			attributeCreate1.flags.display.set(true);

			const onObjectAttributeUpdate1 = actor1.createNode('onObjectAttributeUpdate');
			const setObjectPosition1 = actor1.createNode('setObjectPosition');
			const getParent1 = actor1.createNode('getParent');

			onObjectAttributeUpdate1.setInput(JsConnectionPointType.OBJECT_3D, getParent1);
			onObjectAttributeUpdate1.setAttribName('height');
			setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onObjectAttributeUpdate1);
			(setObjectPosition1.params.get('position') as Vector3Param).set([0, 1, 0]);

			const container = await attributeCreate1.compute();
			const object = container.coreContent()!.threejsObjects()[0] as Mesh;
			assert.equal(object.children.length, 1);
			const child = object.children[0];

			// wait to make sure objects are mounted to the scene
			await CoreSleep.sleep(150);

			await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
				scene.play();
				assert.equal(scene.time(), 0);
				assert.equal(object.position.y, 0);
				await CoreSleep.sleep(500);
				assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
				assert.equal(child.position.y, 0, 'object still at 0');

				new ThreejsObject(object, 0).setAttribValue('height', 1);
				await CoreSleep.sleep(100);
				assert.equal(child.position.y, 1, 'object moved to 1');
			});
		}
	);
}
