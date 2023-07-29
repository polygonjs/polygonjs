import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {SetObjectAttributeInputName} from '../../../../src/engine/nodes/js/SetObjectAttribute';
import {Box3ContainsPointOutputName} from '../../../../src/engine/nodes/js/Box3ContainsPoint';
import {GetGeometryBoundingBoxOutputName} from '../../../../src/engine/nodes/js/GetGeometryBoundingBox';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
export function testenginenodesjsBox3ContainsPoint(qUnit: QUnit) {

qUnit.test('js/box3ContainsPoint', async (assert) => {
	const perspective_camera1 = window.perspective_camera1;
	const scene = window.scene;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const actor1 = geo1.createNode('actor');
	transform1.setInput(0, box1);
	actor1.setInput(0, transform1);

	const onTick1 = actor1.createNode('onTick');
	const box3ContainsPoint1 = actor1.createNode('box3ContainsPoint');
	const getGeometryBoundingBox1 = actor1.createNode('getGeometryBoundingBox');
	const setObjectAttribute1 = actor1.createNode('setObjectAttribute');
	setObjectAttribute1.setAttribType(JsConnectionPointType.BOOLEAN);
	setObjectAttribute1.setAttribName('inBox');

	setObjectAttribute1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	setObjectAttribute1.setInput(
		SetObjectAttributeInputName.val,
		box3ContainsPoint1,
		Box3ContainsPointOutputName.CONTAINS
	);
	box3ContainsPoint1.setInput(
		JsConnectionPointType.BOX3,
		getGeometryBoundingBox1,
		GetGeometryBoundingBoxOutputName.BOX3
	);

	actor1.flags.display.set(true);

	async function getAttribValue() {
		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		return CoreObject.attribValue(object, 'inBox') as boolean;
	}

	assert.equal(await getAttribValue(), undefined);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(await getAttribValue(), undefined);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), true);

		// change the position, argument of box.containsPoint
		box3ContainsPoint1.p.position.set([20, 0, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false);
		box3ContainsPoint1.p.position.set([-20, 0, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false);
		box3ContainsPoint1.p.position.set([0, 0, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), true);

		// change geometry position
		transform1.p.t.set([0, 20, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false);
		transform1.p.t.set([0, 100, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false);
		transform1.p.t.set([0, 0, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), true);
		transform1.p.t.set([0, -10, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false);
		box3ContainsPoint1.p.position.set([0, -10, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), true);
	});
});

}