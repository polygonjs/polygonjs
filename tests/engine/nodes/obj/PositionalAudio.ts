import {DEMO_ASSETS_ROOT_URL} from '../../../../src/core/Assets';

QUnit.test('positionalAudio url can switch without error', async (assert) => {
	const scene = window.scene;

	await scene.waitForCooksCompleted();

	assert.equal(scene.root().audioController.audioListeners().length, 0);
	const positionalAudio = scene.createNode('positionalAudio');
	await positionalAudio.compute();
	assert.equal(scene.root().audioController.audioListeners().length, 0);

	const file1 = positionalAudio.createNode('file');
	const reverb1 = positionalAudio.createNode('reverb');
	const pitchShift1 = positionalAudio.createNode('pitchShift');
	const chorus1 = positionalAudio.createNode('chorus');
	const volume1 = positionalAudio.createNode('volume');

	reverb1.setInput(0, file1);
	pitchShift1.setInput(0, reverb1);
	chorus1.setInput(0, pitchShift1);
	volume1.setInput(0, chorus1);
	positionalAudio.p.audioNode.set(volume1.path());

	await positionalAudio.compute();

	const url1 = `${DEMO_ASSETS_ROOT_URL}/audio/Thrystero_Diagonal-160.mp3`;
	const url2 = `${DEMO_ASSETS_ROOT_URL}/audio/497848__amaida1__helicopter-sound.wav`;

	file1.p.url.set(url1);

	await positionalAudio.compute();
	assert.ok(positionalAudio.states.error.active());
	assert.equal(positionalAudio.states.error.message(), 'a listener is required in the scene');

	scene.createNode('audioListener');
	assert.equal(scene.root().audioController.audioListeners().length, 1);

	assert.ok(!positionalAudio.states.error.active());

	file1.p.url.set(url2);
	await positionalAudio.compute();
	assert.ok(!positionalAudio.states.error.active());

	// to stop the sound from playing
	volume1.p.volume.set(0);
	file1.p.pause.pressButton();
});
