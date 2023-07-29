import type {QUnit} from '../../../../helpers/QUnit';
import {BackgroundMode} from '../../../../../src/engine/nodes/manager/utils/Scene/Background';
import {saveAndLoadScene} from '../../../../helpers/ImportHelper';
export function testenginenodesmanagerrootBackgroundController(qUnit: QUnit) {

qUnit.test('root background is saved and loaded as expected', async (assert) => {
	const scene = window.scene;
	const root = scene.root();

	root.sceneBackgroundController.setMode(BackgroundMode.NONE);
	await saveAndLoadScene(scene, async (scene2) => {
		assert.equal(scene2.root().sceneBackgroundController.backgroundMode(), BackgroundMode.NONE);
	});

	root.sceneBackgroundController.setMode(BackgroundMode.COLOR);
	await saveAndLoadScene(scene, async (scene2) => {
		assert.equal(scene2.root().sceneBackgroundController.backgroundMode(), BackgroundMode.COLOR);
	});

	root.sceneBackgroundController.setMode(BackgroundMode.TEXTURE);
	await saveAndLoadScene(scene, async (scene2) => {
		assert.equal(scene2.root().sceneBackgroundController.backgroundMode(), BackgroundMode.TEXTURE);
	});
});

}