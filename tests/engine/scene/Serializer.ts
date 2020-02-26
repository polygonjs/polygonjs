import {SceneJsonImporter} from '../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../src/engine/io/json/export/Scene';
import {PolyScene} from '../../../src/engine/scene/PolyScene';

QUnit.test('scene save simple', async (assert) => {
	const scene = new PolyScene();
	scene.root.create_node('ambient_light');

	scene.loading_controller.mark_as_loaded();

	const perspective_camera1 = scene.root.create_node('perspective_camera');
	scene.cameras_controller.set_master_camera_node_path(perspective_camera1.full_path());
	perspective_camera1.p.t.z.set(10);

	const geo1 = scene.root.create_node('geo');
	geo1.flags.display.set(true);
	const box1 = geo1.create_node('box');
	box1.flags.display.set(true);
	geo1.p.r.y.set('$F+20');

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene.wait_for_cooks_completed();
	assert.deepEqual(scene2.cameras_controller.master_camera_node?.pv.t.toArray(), [0, 0, 10]);
	assert.ok(scene2.loading_controller.loaded);

	const new_geo1 = scene2.node('/geo1')!;
	assert.ok(new_geo1.p.r.y.has_expression());
	assert.equal(new_geo1.p.r.y.raw_input, '$F+20');
	assert.equal(new_geo1.p.r.y.expression_controller?.expression, '$F+20');
	scene2.set_frame(12);
	await new_geo1.p.r.y.compute();
	assert.equal(new_geo1.p.r.y.value, 32);
	assert.deepEqual(new_geo1.p.r.value.toArray(), [0, 32, 0]);
});
