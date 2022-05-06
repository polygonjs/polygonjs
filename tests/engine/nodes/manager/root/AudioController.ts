import {Camera} from 'three';
import {CoreSleep} from '../../../../../src/core/Sleep';
import {ThreejsViewer} from '../../../../../src/engine/viewers/Threejs';
import {RendererUtils} from '../../../../helpers/RendererUtils';

function soundIcon(viewer: ThreejsViewer<Camera>) {
	return viewer.domElement()?.querySelector('svg') as HTMLElement | undefined;
}
function soundIconIsDisplayAndOn(assert: Assert, viewer: ThreejsViewer<Camera>, state: boolean) {
	const icon = soundIcon(viewer)!;
	if (state) {
		assert.ok(icon.classList.contains('soundOn'), `classes: ${icon.classList}`);
		assert.notOk(icon.classList.contains('soundOff'), `classes: ${icon.classList}`);
	} else {
		assert.ok(icon.classList.contains('soundOff'), `classes: ${icon.classList}`);
		assert.notOk(icon.classList.contains('soundOn'), `classes: ${icon.classList}`);
	}
}
function clickOnSoundIcon(viewer: ThreejsViewer<Camera>) {
	const icon = soundIcon(viewer)!;
	icon.parentElement?.dispatchEvent(new PointerEvent('pointerdown'));
}

QUnit.test('root audio controller simple', async (assert) => {
	const scene = window.scene;
	assert.ok(!scene.loadingController.isLoading());
	const root = scene.root();

	let count = 0;
	const callbackName = 'test';
	root.audioController.onToggleSound(callbackName, () => {
		count++;
	});

	assert.equal(count, 0);
	await root.audioController.toggleSound();
	assert.equal(count, 1);
	await root.audioController.toggleSound();
	assert.equal(count, 2);

	root.p.displayAudioIcon.set(true);
	assert.equal(root.pv.displayAudioIcon, true);
	assert.equal(root.audioController.soundOn(), false);

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		// when the root.toggleSound method is called, audioListener and viewer icon update

		// icon is off as there is no audioListener yet
		assert.equal(root.audioController.soundOn(), false);
		soundIconIsDisplayAndOn(assert, viewer, false);
		assert.equal(root.pv.displayAudioIcon, true);

		const audioListener1 = root.createNode('audioListener');
		assert.equal(audioListener1.pv.soundOn, 1);
		assert.equal(audioListener1.object.masterVolume(), 1);
		assert.equal(root.audioController.soundOn(), true);
		soundIconIsDisplayAndOn(assert, viewer, true);

		await root.audioController.toggleSound();
		assert.equal(count, 3);
		assert.equal(audioListener1.pv.soundOn, 0);
		soundIconIsDisplayAndOn(assert, viewer, false);
		await CoreSleep.sleep(100);
		assert.in_delta(audioListener1.object.masterVolume(), 0, 0.01);

		await root.audioController.toggleSound();
		assert.equal(count, 4);
		assert.equal(audioListener1.pv.soundOn, 1);
		soundIconIsDisplayAndOn(assert, viewer, true);
		await CoreSleep.sleep(100);
		assert.in_delta(audioListener1.object.masterVolume(), 1, 0.01);

		// when the audioListener param is updated, the viewer icon updates
		audioListener1.p.soundOn.set(0);
		soundIconIsDisplayAndOn(assert, viewer, false);
		await CoreSleep.sleep(100);
		assert.in_delta(audioListener1.object.masterVolume(), 0, 0.01);

		audioListener1.p.soundOn.set(1);
		soundIconIsDisplayAndOn(assert, viewer, true);
		await CoreSleep.sleep(100);
		assert.in_delta(audioListener1.object.masterVolume(), 1, 0.01);

		// when clicking on the sound icon, the sound toggle
		clickOnSoundIcon(viewer);
		soundIconIsDisplayAndOn(assert, viewer, false);
		assert.equal(audioListener1.pv.soundOn, 0);
		assert.equal(root.audioController.soundOn(), false);
		await CoreSleep.sleep(100);
		await CoreSleep.sleep(1000);
		assert.in_delta(audioListener1.object.masterVolume(), 0, 0.01);

		clickOnSoundIcon(viewer);
		soundIconIsDisplayAndOn(assert, viewer, true);
		assert.equal(audioListener1.pv.soundOn, 1);
		assert.equal(root.audioController.soundOn(), true);
		await CoreSleep.sleep(100);
		assert.in_delta(audioListener1.object.masterVolume(), 1, 0.01);

		// when the audioListener is removed, sound is off
		root.removeNode(audioListener1);
		await CoreSleep.sleep(100);
		soundIconIsDisplayAndOn(assert, viewer, false);
		assert.equal(root.audioController.soundOn(), false);
		assert.in_delta(audioListener1.object.masterVolume(), 0, 0.01);
	});
});

QUnit.test('root audio controller sound icon display controller by root param', async (assert) => {
	const scene = window.scene;
	const root = scene.root();

	root.p.displayAudioIcon.set(1);
	assert.equal(root.audioController.soundOn(), false);
	const audioListener1 = root.createNode('audioListener');
	assert.equal(audioListener1.pv.soundOn, true);
	assert.equal(root.audioController.soundOn(), true);

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		assert.equal(root.audioController.soundOn(), true);
		soundIconIsDisplayAndOn(assert, viewer, true);
	});
});

// that test does not make sense as the soundOn setting is on the audioListener
// QUnit.test(
// 	'root audio controller: creating an audioListener after setting sound to off will also turn it off',
// 	async (assert) => {
// 		const scene = create_scene();
// 		assert.ok(!scene.loadingController.isLoading());
// 		const root = scene.root();

// 		let count = 0;
// 		const callbackName = 'test';
// 		root.audioController.onToggleSound(callbackName, () => {
// 			count++;
// 		});

// 		assert.equal(count, 0);
// 		root.audioController.toggleSound();
// 		assert.equal(count, 1);
// 		root.audioController.toggleSound();
// 		assert.equal(count, 2);

// 		// when the root.toggleSound method is called, audioListener and viewer icon update
// 		const audioListener1 = root.createNode('audioListener');
// 		assert.equal(audioListener1.pv.soundOn, 0);
// 		await CoreSleep.sleep(100);
// 		assert.in_delta(audioListener1.object.masterVolume(), 0, 0.01);

// 		root.audioController.toggleSound();
// 		assert.equal(count, 3);
// 		assert.equal(audioListener1.pv.soundOn, 1);
// 	}
// );
