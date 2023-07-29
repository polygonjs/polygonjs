import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {SetObjectAttributeInputName} from '../../../../src/engine/nodes/js/SetObjectAttribute';
import {
	Box3IntersectsBox3OutputName,
	Box3IntersectsBox3InputName,
} from '../../../../src/engine/nodes/js/Box3IntersectsBox3';
import {GetGeometryBoundingBoxOutputName} from '../../../../src/engine/nodes/js/GetGeometryBoundingBox';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
export function testenginenodesjsBox3IntersectsBox3(qUnit: QUnit) {

qUnit.test('js/box3IntersectsBox3', async (assert) => {
	const perspective_camera1 = window.perspective_camera1;
	const scene = window.scene;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const actor1 = geo1.createNode('actor');
	transform1.setInput(0, box1);
	actor1.setInput(0, transform1);

	const onTick1 = actor1.createNode('onTick');
	const box3_1 = actor1.createNode('box3');
	const box3IntersectsBox3_1 = actor1.createNode('box3IntersectsBox3');
	const getGeometryBoundingBox1 = actor1.createNode('getGeometryBoundingBox');
	const setObjectAttribute1 = actor1.createNode('setObjectAttribute');
	setObjectAttribute1.setAttribType(JsConnectionPointType.BOOLEAN);
	setObjectAttribute1.setAttribName('inBox');

	setObjectAttribute1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	setObjectAttribute1.setInput(
		SetObjectAttributeInputName.val,
		box3IntersectsBox3_1,
		Box3IntersectsBox3OutputName.INTERSECTS
	);
	box3IntersectsBox3_1.setInput(
		Box3IntersectsBox3InputName.BOX3a,
		getGeometryBoundingBox1,
		GetGeometryBoundingBoxOutputName.BOX3
	);
	box3IntersectsBox3_1.setInput(Box3IntersectsBox3InputName.BOX3b, box3_1);

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
		box3_1.p.max.set([20, 20, 20]);
		box3_1.p.min.set([19, 19, 19]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false);
		box3_1.p.max.set([-19, -19, -19]);
		box3_1.p.min.set([-20, -20, -20]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false);
		box3_1.p.max.set([19, 19, 19]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), true);

		// change geometry position
		transform1.p.t.set([0, -21, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false, '-20');
		transform1.p.t.set([0, 100, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false, '100');
		transform1.p.t.set([0, 0, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), true, '0');
		transform1.p.t.set([0, 20, 0]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), false, '-10');
		transform1.p.t.set([-10, -10, -10]);
		box3_1.p.max.set([-9, -9, -9]);
		box3_1.p.min.set([-11, -11, -11]);
		await CoreSleep.sleep(50);
		assert.equal(await getAttribValue(), true, '-9,-11');
	});
});

}