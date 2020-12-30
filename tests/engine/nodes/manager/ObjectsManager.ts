import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {CoreSleep} from '../../../../src/core/Sleep';

function create_scene() {
	const scene = new PolyScene();
	scene.setName('create_scene');
	scene.root.createNode('ambientLight');

	scene.loading_controller.mark_as_loaded();

	const perspective_camera1 = scene.root.createNode('perspectiveCamera');
	scene.camerasController.setMasterCameraNodePath(perspective_camera1.fullPath());
	perspective_camera1.p.t.z.set(10);

	const geo1 = scene.root.createNode('geo');
	geo1.flags.display.set(true);
	const box1 = geo1.createNode('box');
	box1.flags.display.set(true);
	geo1.p.r.y.set('$F+20');

	return scene;
}

QUnit.test('root adds objects to hierarchy when created with api', async (assert) => {
	const scene = create_scene();
	assert.ok(!scene.loading_controller.is_loading);

	await scene.wait_for_cooks_completed();
	assert.equal(scene.default_scene.children[0].children.length, 3);
	assert.deepEqual(scene.default_scene.children[0].children.map((n) => n.name).sort(), [
		'/ambientLight1',
		'/geo1',
		'/perspectiveCamera1',
	]);
});

QUnit.test('root adds objects to hierarchy when loaded from json', async (assert) => {
	const scene = create_scene();
	assert.ok(!scene.loading_controller.is_loading);

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.load_data(data);
	assert.ok(scene2.loading_controller.loaded, 'scene is loaded');
	assert.ok(scene2.loading_controller.auto_updating, 'scene is auto updating');
	scene2.setName('from_load');

	await CoreSleep.sleep(2000);
	assert.equal(scene2.default_scene.children[0].children.length, 3);
	assert.deepEqual(scene2.default_scene.children[0].children.map((n) => n.name).sort(), [
		'/ambientLight1',
		'/geo1',
		'/perspectiveCamera1',
	]);
});
