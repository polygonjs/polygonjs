import {PolyScene} from 'src/engine/scene/PolyScene';
import {SceneJsonExporter} from 'src/engine/io/json/export/Scene';
import {SceneJsonImporter} from 'src/engine/io/json/import/Scene';

function create_scene() {
	const scene = new PolyScene();
	scene.set_name('create_scene');
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

	return scene;
}

QUnit.test('root adds objects to hierarchy when created with api', async (assert) => {
	const scene = create_scene();
	assert.ok(!scene.loading_controller.is_loading);

	await scene.wait_for_cooks_completed();
	assert.equal(scene.display_scene.children[0].children.length, 3);
	assert.deepEqual(scene.display_scene.children[0].children.map((n) => n.name).sort(), [
		'/ambient_light1',
		'/geo1',
		'/perspective_camera1',
	]);
});

QUnit.test('root adds objects to hierarchy when loaded from json', async (assert) => {
	const scene = create_scene();
	assert.ok(!scene.loading_controller.is_loading);

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.load_data(data);
	assert.ok(scene2.loading_controller.loaded, 'scene is loaded');
	assert.ok(scene2.loading_controller.auto_updating, 'scene is auto updating');
	scene2.set_name('from_load');

	await window.sleep(2000);
	assert.equal(scene2.display_scene.children[0].children.length, 3);
	assert.deepEqual(scene2.display_scene.children[0].children.map((n) => n.name).sort(), [
		'/ambient_light1',
		'/geo1',
		'/perspective_camera1',
	]);
});
