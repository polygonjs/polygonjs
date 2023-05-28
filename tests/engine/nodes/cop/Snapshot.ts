import {SRGBColorSpace} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('COP snapshot from video', async (assert) => {
	const COP = window.COP;

	const video1 = COP.createNode('video');
	video1.p.url1.set(`${ASSETS_ROOT}/textures/sintel.mp4`);
	video1.p.url2.set(`${ASSETS_ROOT}/textures/sintel.ogv`);
	video1.p.tcolorSpace.set(true);
	video1.p.colorSpace.set(SRGBColorSpace);

	const snapshot1 = COP.createNode('snapshot');
	snapshot1.setInput(0, video1);

	let container = await snapshot1.compute();
	assert.equal(snapshot1.states.error.message(), 'video not loaded');

	await CoreSleep.sleep(1000);

	snapshot1.p.capture.pressButton();
	container = await snapshot1.compute();
	assert.notOk(snapshot1.states.error.message());

	let texture = container.texture();
	assert.equal(texture.image.width, 480);
	assert.equal(texture.image.height, 204);
	assert.equal(texture.encoding, 3001);

	setTimeout(() => {
		video1.dispose();
	}, 1000);
});

QUnit.test('COP snapshot from webcam', async (assert) => {
	const COP = window.COP;

	const webcam1 = COP.createNode('webCam');
	webcam1.p.tcolorSpace.set(true);
	webcam1.p.colorSpace.set(SRGBColorSpace);

	const snapshot1 = COP.createNode('snapshot');
	snapshot1.setInput(0, webcam1);

	let container = await snapshot1.compute();
	// assert.equal(snapshot1.states.error.message(), 'video not loaded');

	// await CoreSleep.sleep(2000);

	snapshot1.p.capture.pressButton();
	container = await snapshot1.compute();
	assert.notOk(snapshot1.states.error.message());

	let texture = container.texture();
	assert.equal(texture.image.width, 1024);
	assert.equal(texture.image.height, 960);
	assert.equal(texture.encoding, 3001);

	setTimeout(() => {
		webcam1.dispose();
	}, 1000);
});
