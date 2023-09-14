import type {QUnit} from '../../../helpers/QUnit';
import {Mesh, Vector3} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {ThreejsObject} from '../../../../src/core/geometry/modules/three/ThreejsObject';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
export function testenginenodesjsGetObjectAttribute(qUnit: QUnit) {
	qUnit.test('js/GetObjectAttribute', async (assert) => {
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

		const onTick1 = actor1.createNode('onTick');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const floatToVec3_1 = actor1.createNode('floatToVec3');
		const getObjectAttribute1 = actor1.createNode('getObjectAttribute');

		getObjectAttribute1.setAttribName('height');
		getObjectAttribute1.setAttribType(JsConnectionPointType.FLOAT);

		floatToVec3_1.setInput(1, getObjectAttribute1);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onTick1);
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

	qUnit.test('js/GetObjectAttribute with default value (float)', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		// const attributeCreate1 = geo1.createNode('attribCreate');
		const actor1 = geo1.createNode('actor');

		// attributeCreate1.setAttribClass(AttribClass.OBJECT);
		// attributeCreate1.p.name.set('height');

		// attributeCreate1.setInput(0, box1);
		actor1.setInput(0, box1);
		actor1.flags.display.set(true);

		const onTick1 = actor1.createNode('onTick');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const floatToVec3_1 = actor1.createNode('floatToVec3');
		const getObjectAttribute1 = actor1.createNode('getObjectAttribute');

		getObjectAttribute1.setAttribName('height');
		getObjectAttribute1.setAttribType(JsConnectionPointType.FLOAT);
		(getObjectAttribute1.params.get('defaultFloat') as FloatParam).set(-1);

		floatToVec3_1.setInput(1, getObjectAttribute1);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onTick1);
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
			assert.equal(object.position.y, -1, 'object starts at -1');

			new ThreejsObject(object, 0).setAttribValue('height', 1);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, 1, 'object moved to 1');

			new ThreejsObject(object, 0).setAttribValue('height', 0.5);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, 0.5, 'object moved to 0.5');
		});
	});

	qUnit.test('js/GetObjectAttribute with default value (vector3)', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		// const attributeCreate1 = geo1.createNode('attribCreate');
		const actor1 = geo1.createNode('actor');

		// attributeCreate1.setAttribClass(AttribClass.OBJECT);
		// attributeCreate1.p.name.set('height');

		// attributeCreate1.setInput(0, box1);
		actor1.setInput(0, box1);
		actor1.flags.display.set(true);

		const onTick1 = actor1.createNode('onTick');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		// const floatToVec3_1 = actor1.createNode('floatToVec3');
		const getObjectAttribute1 = actor1.createNode('getObjectAttribute');

		getObjectAttribute1.setAttribName('height');
		getObjectAttribute1.setAttribType(JsConnectionPointType.VECTOR3);
		(getObjectAttribute1.params.get('defaultVector3') as Vector3Param).set([-1, -2, -3]);

		// floatToVec3_1.setInput(1, getObjectAttribute1);

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onTick1);
		setObjectPosition1.setInput('position', getObjectAttribute1);

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
			assert.equal(object.position.x, -1, 'object x starts at -1');
			assert.equal(object.position.y, -2, 'object y starts at -2');
			assert.equal(object.position.z, -3, 'object z starts at -3');

			new ThreejsObject(object, 0).setAttribValue('height', new Vector3(1, 2, 3));
			await CoreSleep.sleep(100);
			assert.equal(object.position.x, 1, 'object x moved to 1');
			assert.equal(object.position.y, 2, 'object y moved to 2');
			assert.equal(object.position.z, 3, 'object z moved to 3');

			new ThreejsObject(object, 0).setAttribValue('height', new Vector3(7, 4, 12));
			await CoreSleep.sleep(100);
			assert.equal(object.position.x, 7, 'object x moved to 7');
			assert.equal(object.position.y, 4, 'object y moved to 4');
			assert.equal(object.position.z, 12, 'object z moved to 12');
		});
	});
}
