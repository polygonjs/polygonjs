import {SceneJsonImporter} from '../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../src/engine/io/json/export/Scene';
import {PolyScene} from '../../../src/engine/scene/PolyScene';
import {PerspectiveCameraObjNode} from '../../../src/engine/nodes/obj/PerspectiveCamera';
import {GeoObjNode} from '../../../src/engine/nodes/obj/Geo';

QUnit.test('scene save simple', async (assert) => {
	const scene = new PolyScene();
	scene.root().createNode('ambientLight');

	scene.loadingController.markAsLoaded();

	const perspective_camera1 = scene.root().createNode('perspectiveCamera');
	scene.camerasController.setMasterCameraNodePath(perspective_camera1.fullPath());
	perspective_camera1.p.t.z.set(10);

	const geo1 = scene.root().createNode('geo');
	geo1.flags.display.set(true);
	const box1 = geo1.createNode('box');
	box1.flags.display.set(true);
	geo1.p.r.y.set('$F+20');

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();
	const camera_node = scene2.camerasController.masterCameraNode() as PerspectiveCameraObjNode;
	assert.deepEqual(camera_node.pv.t.toArray(), [0, 0, 10]);
	assert.ok(scene2.loadingController.loaded());

	const new_geo1 = scene2.node('/geo1')! as GeoObjNode;
	assert.ok(new_geo1.p.r.y.hasExpression());
	assert.equal(new_geo1.p.r.y.raw_input, '$F+20');
	assert.equal(new_geo1.p.r.y.expressionController?.expression(), '$F+20');
	scene2.setFrame(12);
	await new_geo1.p.r.y.compute();
	assert.equal(new_geo1.p.r.y.value, 32);
	assert.deepEqual(new_geo1.p.r.value.toArray(), [0, 32, 0]);
});
