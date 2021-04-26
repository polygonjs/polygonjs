import {DEMO_ASSETS_ROOT_URL} from '../../../../src/core/Assets';

QUnit.test('positionalAudio url can switch without error', async (assert) => {
	const scene = window.scene;
	const positionalAudio = scene.createNode('positionalAudio');
	const audioListener = scene.createNode('audioListener');
	positionalAudio.p.listener.set(audioListener.path());

	const url1 = `${DEMO_ASSETS_ROOT_URL}/audio/Thrystero_Diagonal-160.mp3`;
	const url2 = `${DEMO_ASSETS_ROOT_URL}/audio/497848__amaida1__helicopter-sound.wav`;

	positionalAudio.p.url.set(url1);
	await positionalAudio.compute();
	assert.ok(!positionalAudio.states.error.active());
	positionalAudio.p.url.set(url2);
	await positionalAudio.compute();
	assert.ok(!positionalAudio.states.error.active());
});
