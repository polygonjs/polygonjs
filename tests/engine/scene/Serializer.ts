import type {QUnit} from '../../helpers/QUnit';
import {PolyScene} from '../../../src/engine/scene/PolyScene';
import {PerspectiveCameraObjNode} from '../../../src/engine/nodes/obj/PerspectiveCamera';
import {GeoObjNode} from '../../../src/engine/nodes/obj/Geo';
import {saveAndLoadScene} from '../../helpers/ImportHelper';
export function testenginesceneSerializer(qUnit: QUnit) {

qUnit.test('scene save simple', async (assert) => {
	const scene = new PolyScene();
	scene.setFrame(1);
	scene.root().createNode('ambientLight');

	scene.loadingController.markAsLoaded();

	const perspective_camera1 = scene.root().createNode('perspectiveCamera');
	scene.camerasController.setMainCameraPath(perspective_camera1.path());
	perspective_camera1.p.t.z.set(10);

	const geo1 = scene.root().createNode('geo');
	geo1.flags.display.set(true);
	const box1 = geo1.createNode('box');
	box1.flags.display.set(true);
	geo1.p.r.y.set('$F+20');

	await saveAndLoadScene(scene, async (scene2) => {
		await scene2.waitForCooksCompleted();
		const camera_node = scene2.node(perspective_camera1.path()) as PerspectiveCameraObjNode;
		assert.deepEqual(camera_node.pv.t.toArray(), [0, 0, 10]);
		assert.ok(scene2.loadingController.loaded());

		const new_geo1 = scene2.node('/geo1')! as GeoObjNode;
		assert.ok(new_geo1.p.r.y.hasExpression());
		assert.equal(new_geo1.p.r.y.rawInput(), '$F+20');
		assert.equal(new_geo1.p.r.y.expressionController?.expression(), '$F+20');
		scene2.setFrame(12);
		await new_geo1.p.r.y.compute();
		assert.equal(new_geo1.p.r.y.value, 32);
		assert.deepEqual(new_geo1.p.r.value.toArray(), [0, 32, 0]);
	});
});

}