import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {CoreSleep} from '../../../../src/core/Sleep';

function create_scene() {
	const scene = new PolyScene();
	scene.setName('create_scene');
	scene.root().createNode('ambientLight');

	scene.loadingController.markAsLoaded();

	const perspective_camera1 = scene.root().createNode('perspectiveCamera');
	scene.camerasController.setMainCameraNodePath(perspective_camera1.path());
	perspective_camera1.p.t.z.set(10);

	const geo1 = scene.root().createNode('geo');
	geo1.flags.display.set(true);
	const box1 = geo1.createNode('box');
	box1.flags.display.set(true);
	geo1.p.r.y.set('$F+20');

	return scene;
}

QUnit.test('root adds objects to hierarchy when created with api', async (assert) => {
	const scene = create_scene();
	assert.ok(!scene.loadingController.isLoading());

	await scene.waitForCooksCompleted();
	assert.equal(scene.threejsScene().children.length, 3);
	assert.deepEqual(
		scene
			.threejsScene()
			.children.map((n) => n.name)
			.sort(),
		['/ambientLight1', '/geo1', '/perspectiveCamera1']
	);
});

QUnit.test('root adds objects to hierarchy when loaded from json', async (assert) => {
	const scene = create_scene();
	assert.ok(!scene.loadingController.isLoading());

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.loadData(data);
	assert.ok(scene2.loadingController.loaded(), 'scene is loaded');
	assert.ok(scene2.loadingController.autoUpdating(), 'scene is auto updating');
	scene2.setName('from_load');

	await CoreSleep.sleep(2000);
	assert.equal(scene2.threejsScene().children.length, 3);
	assert.deepEqual(
		scene2
			.threejsScene()
			.children.map((n) => n.name)
			.sort(),
		['/ambientLight1', '/geo1', '/perspectiveCamera1']
	);
});
