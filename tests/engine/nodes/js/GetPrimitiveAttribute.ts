import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GetPrimitiveAttributeInputName} from '../../../../src/engine/nodes/js/GetPrimitiveAttribute';
import {FloatParam} from '../../../../src/engine/params/Float';
export function testenginenodesjsGetPrimitiveAttribute(qUnit: QUnit) {
	qUnit.test('js/GetPrimitiveAttribute', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const attributeCreate1 = geo1.createNode('attribCreate');
		const actor1 = geo1.createNode('actor');

		attributeCreate1.setAttribClass(AttribClass.PRIMITIVE);
		attributeCreate1.p.name.set('height');
		attributeCreate1.p.value1.set(`@primnum+1`);

		attributeCreate1.setInput(0, box1);
		actor1.setInput(0, attributeCreate1);
		actor1.flags.display.set(true);

		const onTick1 = actor1.createNode('onTick');
		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const floatToVec3_1 = actor1.createNode('floatToVec3');
		const getPrimitiveAttribute1 = actor1.createNode('getPrimitiveAttribute');

		getPrimitiveAttribute1.setAttribName('height');
		getPrimitiveAttribute1.setAttribType(JsConnectionPointType.FLOAT);
		const primitiveIndexParam = getPrimitiveAttribute1.params.get(
			GetPrimitiveAttributeInputName.primitiveIndex
		) as FloatParam;
		primitiveIndexParam.set(0);
		const defaultValueParam = getPrimitiveAttribute1.params.get(
			getPrimitiveAttribute1.defaultValueName()
		) as FloatParam;
		defaultValueParam.set(-1);

		floatToVec3_1.setInput(1, getPrimitiveAttribute1);

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
			assert.equal(object.position.y, 1, 'object moved to 1');

			primitiveIndexParam.set(1);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, 2, 'object moved to 2');

			primitiveIndexParam.set(2);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, 3, 'object moved to 3');

			primitiveIndexParam.set(3);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, 4, 'object moved to 4');

			primitiveIndexParam.set(-1);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, -1, 'object moved to -1');

			primitiveIndexParam.set(4);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, 5, 'object moved to 5');

			primitiveIndexParam.set(9999999);
			await CoreSleep.sleep(100);
			assert.equal(object.position.y, -1, 'object moved to -1');
		});
	});
}
