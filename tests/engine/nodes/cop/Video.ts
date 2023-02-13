import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {VideoMode} from '../../../../src/engine/nodes/cop/Video';

QUnit.test('COP video simple mp4', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('video');
	file1.p.urlsCount.set(1);
	file1.p.url1.set(`${ASSETS_ROOT}/textures/sintel.mp4`);

	const container = await file1.compute();
	assert.ok(!file1.states.error.message());
	const texture = container.texture();
	assert.equal(texture.image.videoWidth, 480);
	assert.equal(texture.image.videoHeight, 204);
	assert.deepEqual(container.resolution(), [480, 204]);

	setTimeout(() => {
		file1.dispose();
	}, 1000);
});
QUnit.test('COP video simple ogv', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('video');
	file1.p.urlsCount.set(1);
	file1.p.url1.set(`${ASSETS_ROOT}/textures/sintel.ogv`);

	const container = await file1.compute();
	assert.ok(!file1.states.error.message());
	const texture = container.texture();
	assert.equal(texture.image.videoWidth, 480);
	assert.equal(texture.image.videoHeight, 204);
	assert.deepEqual(container.resolution(), [480, 204]);

	setTimeout(() => {
		file1.dispose();
	}, 1000);
});
QUnit.test('COP video from selector', async (assert) => {
	const COP = window.COP;

	const videoElement = document.createElement('video');
	videoElement.setAttribute('crossOrigin', 'anonymous');
	videoElement.setAttribute('playinline', `${true}`);
	videoElement.setAttribute('muted', `${true}`);
	videoElement.setAttribute('autoplay', `${true}`); // to ensure it loads
	videoElement.id = 'test-video';
	const source1 = document.createElement('source');
	const source2 = document.createElement('source');
	source1.src = `${ASSETS_ROOT}/textures/sintel.mp4`;
	source2.src = `${ASSETS_ROOT}/textures/sintel.ogv`;
	videoElement.append(source1);
	videoElement.append(source2);
	document.body.append(videoElement);

	const video1 = COP.createNode('video');
	video1.setMode(VideoMode.FROM_HTML_ELEMENT);
	video1.p.selector.set(`#test-video`);

	const container = await video1.compute();
	assert.ok(!video1.states.error.message());
	const texture = container.texture();
	assert.equal(texture.image.videoWidth, 480);
	assert.equal(texture.image.videoHeight, 204);
	assert.deepEqual(container.resolution(), [480, 204]);

	setTimeout(() => {
		document.body.removeChild(videoElement);
	}, 100);
});
