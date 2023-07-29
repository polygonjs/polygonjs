import type {QUnit} from '../../helpers/QUnit';
import {PolyScene} from '../../../src/engine/scene/PolyScene';
import {SceneJsonExporter} from '../../../src/engine/io/json/export/Scene';
import {ActorSopNode} from '../../../src/engine/nodes/sop/Actor';
import {SceneDataImportOptions, ScenePlayerImporter} from '../../../src/engine/io/player/Scene';
import {CoreSleep} from '../../../src/core/Sleep';
export function testengineioPlayer(qUnit: QUnit) {

interface LoadSceneOptions {
	autoPlay: boolean;
	createViewer: boolean;
}
type Callback = (scene: PolyScene) => Promise<void>;
async function loadScene(scene: PolyScene, options: LoadSceneOptions, callback: Callback) {
	return new Promise(async (resolve) => {
		const sceneData = await new SceneJsonExporter(scene).data();

		const domElement = document.createElement('div');
		document.body.appendChild(domElement);
		const _options: SceneDataImportOptions = {
			sceneData,
			domElement,
			sceneName: 'test',
			configureScene: (scene) => {
				// scene.assets.setRoot(assetsRoot);
			},
			onProgress: async (progress) => {
				// console.log(progress);
				if (progress >= 1) {
					await callback(data.scene);
					resolve(undefined);
				}
			},
			createViewer: options.createViewer,
			autoPlay: options.autoPlay,
		};
		const data = await ScenePlayerImporter.loadSceneData(_options);

		document.body.removeChild(domElement);
	});
}

qUnit.test('scene loads with autoPlay=false', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const geo2 = scene.root().createNode('geo');

	const sphere1 = geo1.createNode('sphere');
	const actor1 = geo1.createNode('actor');
	const onScenePlay = actor1.createNode('onScenePlay');
	const setObjectPosition = actor1.createNode('setObjectPosition');

	actor1.setInput(0, sphere1);
	actor1.flags.display.set(true);
	setObjectPosition.setInput(0, onScenePlay);
	setObjectPosition.p.position.set([0, 1, 0]);

	const text1 = geo2.createNode('text');
	text1.p.text.set('`$F`');

	async function _getSphereY(_scene: PolyScene) {
		const node = _scene.node(actor1.path()) as ActorSopNode;
		const container = await node.compute();
		const coreGroup = container.coreContent()!;
		const object = coreGroup.threejsObjectsWithGeo()[0];
		return object.position.y;
	}

	await loadScene(scene, {autoPlay: false, createViewer: false}, async (scene) => {
		await CoreSleep.sleep(50);
		assert.notOk(scene.timeController.playing(), 'scene not playing');
		assert.equal(await _getSphereY(scene), 0, 'position not set');
		scene.play();
		await CoreSleep.sleep(50);
		assert.equal(await _getSphereY(scene), 1, 'position set');
	});
	await loadScene(scene, {autoPlay: true, createViewer: false}, async (scene) => {
		await CoreSleep.sleep(50);
		assert.ok(scene.timeController.playing(), 'scene playing');

		assert.equal(await _getSphereY(scene), 1, 'position set');
	});
	await loadScene(scene, {autoPlay: false, createViewer: true}, async (scene) => {
		await CoreSleep.sleep(50);
		assert.notOk(scene.timeController.playing(), 'scene not playing');
		assert.equal(await _getSphereY(scene), 0, 'position not set');
		scene.play();
		await CoreSleep.sleep(50);
		assert.equal(await _getSphereY(scene), 1, 'position set');
	});
	await loadScene(scene, {autoPlay: true, createViewer: true}, async (scene) => {
		await CoreSleep.sleep(50);
		assert.ok(scene.timeController.playing(), 'scene playing');

		assert.equal(await _getSphereY(scene), 1, 'position set');
	});
});

}