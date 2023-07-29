import type {QUnit} from '../../../helpers/QUnit';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
export function testenginenodesaudioFile(qUnit: QUnit) {

qUnit.test('audio/file onStop callbacks', async (assert) => {
	const scene = window.scene;

	scene.root().createNode('audioListener');
	const positionalAudio1 = scene.root().createNode('positionalAudio');

	const file1 = positionalAudio1.createNode('file');
	positionalAudio1.p.audioNode.setNode(file1);

	let stopDetected: boolean = false;

	file1.p.autostart.set(0);
	file1.p.loop.set(0);
	file1.onStop(() => {
		stopDetected = true;
	});
	file1.p.url.set(`${ASSETS_ROOT}/audio/497848__amaida1__helicopter-sound.ogg`);
	file1.p.play.pressButton();

	assert.notOk(stopDetected);
	await CoreSleep.sleep(4000);

	file1.p.pause.pressButton();
	await CoreSleep.sleep(1000);
	assert.ok(stopDetected);
	file1.p.play.pressButton();

	stopDetected = false;
	await CoreSleep.sleep(4000);
	assert.notOk(stopDetected);
	await CoreSleep.sleep(4000);
	assert.ok(stopDetected);
});

}