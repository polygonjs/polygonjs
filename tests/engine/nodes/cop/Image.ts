import type {QUnit} from '../../../helpers/QUnit';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {CopTypeImage} from '../../../../src/engine/poly/registers/nodes/types/Cop';
import {Number2} from '../../../../src/types/GlobalTypes';
export function testenginenodescopImage(qUnit: QUnit) {

qUnit.test('COP image simple default', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('image');

	let container, texture;

	container = await file1.compute();
	assert.ok(!file1.states.error.message());
	texture = container.texture();
	assert.equal(texture.image.width, 512);
	assert.deepEqual(container.resolution(), [512, 512]);
});

qUnit.test('cop/image with webp', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('image');
	file1.p.url.set(`${ASSETS_ROOT}/textures/uv.webp`);

	const container = await file1.compute();
	assert.notOk(file1.states.error.message());
	const texture = container.texture();
	assert.equal(texture.image.width, 512);
	assert.equal(texture.image.height, 512);
});
qUnit.test('cop/image with png', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('image');
	file1.p.url.set(`${ASSETS_ROOT}/textures/road_diffuse.001.png`);

	const container = await file1.compute();
	assert.notOk(file1.states.error.message());
	const texture = container.texture();
	assert.equal(texture.image.width, 2048);
	assert.equal(texture.image.height, 1024);
});

qUnit.test('COP image simple with bad path', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('image');
	file1.p.url.set('/doesnotexists.jpg');

	// let container, texture;

	/*container = */ await file1.compute();
	assert.equal(file1.states.error.message(), "could not load texture '/doesnotexists.jpg'");
	// texture = container.texture();
	// assert.equal(texture.image.width, 512);
	// assert.equal(texture.image.height, 512);
});

qUnit.test('COP image simple exr', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('imageEXR');
	file1.p.url.set(`${ASSETS_ROOT}/textures/piz_compressed.exr`);

	let container, texture;

	container = await file1.compute();
	assert.ok(!file1.states.error.message());
	texture = container.texture();
	assert.equal(texture.image.width, 1024);
	assert.equal(texture.image.height, 512);
	assert.deepEqual(container.resolution(), [1024, 512]);
});

qUnit.test('COP image simple ktx2', async (assert) => {
	const COP = window.COP;

	// create renderer for basis loader
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	assert.ok(renderer);

	const file1 = COP.createNode('imageKTX2');
	file1.p.url.set(`${ASSETS_ROOT}/textures/sample_uastc_zstd.ktx2`);

	let container, texture;

	container = await file1.compute();
	assert.ok(!file1.states.error.message());
	texture = container.texture();
	assert.equal(texture.image.width, 1000);
	assert.equal(texture.image.height, 1392);

	RendererUtils.dispose();
});

qUnit.test('COP image simple hdr', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('imageHDR');
	file1.p.url.set(`${ASSETS_ROOT}/textures/equirectangular/spot1Lux.hdr`);

	let container, texture;

	container = await file1.compute();
	assert.ok(!file1.states.error.message());
	texture = container.texture();
	assert.equal(texture.image.width, 1024);
	assert.equal(texture.image.height, 512);
});

qUnit.test('COP image transform param can be time dependent', async (assert) => {
	const COP = window.COP;
	const scene = window.scene;

	const file1 = COP.createNode('image');
	file1.p.url.set(`${ASSETS_ROOT}/textures/uv.jpg`);

	let container = await file1.compute();
	assert.ok(!file1.states.error.message());
	let texture = container.texture();
	assert.equal(texture.image.width, 512);
	assert.equal(texture.image.height, 512);
	assert.deepEqual(texture.offset.toArray(), [0, 0], 'offset is 0,0');

	file1.p.ttransform.set(true);

	file1.p.offset.set([0.1, 5]);
	await CoreSleep.sleep(100);
	assert.deepEqual(texture.offset.toArray(), [0.1, 5], 'A');

	scene.setFrame(2);
	file1.p.offset.set(['$F', '$F*2']);
	await CoreSleep.sleep(100);
	assert.deepEqual(texture.offset.toArray(), [2, 4], 'B');

	scene.setFrame(4);
	await CoreSleep.sleep(100);
	assert.deepEqual(texture.offset.toArray(), [4, 8], 'C');
});

qUnit.test('COP images with default values', async (assert) => {
	const COP = window.COP;

	// create renderer for basis loader
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	assert.ok(renderer);

	async function testFileType(fileType: CopTypeImage, res: Number2) {
		const fileNode = COP.createNode(fileType);

		const container = await fileNode.compute();
		assert.deepEqual(container.resolution(), res, fileType);
	}

	await testFileType(CopTypeImage.IMAGE, [512, 512]);
	await testFileType(CopTypeImage.IMAGE_EXR, [1024, 512]);
	await testFileType(CopTypeImage.IMAGE_HDR, [2048, 1024]);
	await testFileType(CopTypeImage.IMAGE_KTX2, [1000, 1392]);
});

qUnit.skip('COP refers a path in another node', async (assert) => {
	// check that the graph is set correctly, but changing the referred path
});

}