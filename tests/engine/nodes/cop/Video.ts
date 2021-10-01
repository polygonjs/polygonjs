import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

QUnit.test('COP video simple mp4', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('video');
	file1.p.url.set(`${ASSETS_ROOT}/textures/sintel.mp4`);

	const container = await file1.compute();
	assert.ok(!file1.states.error.message());
	console.log(file1.states.error.message());
	const texture = container.texture();
	assert.equal(texture.image.videoWidth, 480);
	assert.equal(texture.image.videoHeight, 204);
	assert.deepEqual(container.resolution(), [480, 204]);
});
QUnit.test('COP video simple ogv', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('video');
	file1.p.url.set(`${ASSETS_ROOT}/textures/sintel.ogv`);

	const container = await file1.compute();
	assert.ok(!file1.states.error.message());
	const texture = container.texture();
	assert.equal(texture.image.videoWidth, 480);
	assert.equal(texture.image.videoHeight, 204);
	assert.deepEqual(container.resolution(), [480, 204]);
});
