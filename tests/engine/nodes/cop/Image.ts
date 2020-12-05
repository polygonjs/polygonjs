import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('COP image simple default', async (assert) => {
	const COP = window.COP;

	const file1 = COP.create_node('image');

	let container, texture;

	container = await file1.request_container();
	assert.ok(!file1.states.error.message);
	texture = container.texture();
	assert.equal(texture.image.width, 512);
	assert.equal(texture.image.height, 512);
});

QUnit.test('COP image simple with bad path', async (assert) => {
	const COP = window.COP;

	const file1 = COP.create_node('image');
	file1.p.url.set('/doesnotexists.jpg');

	// let container, texture;

	/*container = */ await file1.request_container();
	assert.equal(file1.states.error.message, "could not load texture '/doesnotexists.jpg'");
	// texture = container.texture();
	// assert.equal(texture.image.width, 512);
	// assert.equal(texture.image.height, 512);
});

QUnit.test('COP image simple exr', async (assert) => {
	const COP = window.COP;

	const file1 = COP.create_node('image');
	file1.p.url.set('/examples/textures/piz_compressed.exr');

	let container, texture;

	container = await file1.request_container();
	assert.ok(!file1.states.error.message);
	texture = container.texture();
	assert.equal(texture.image.width, 1024);
	assert.equal(texture.image.height, 512);
});

QUnit.test('COP image simple basis', async (assert) => {
	const COP = window.COP;

	// create renderer for basis loader
	const {renderer} = await RendererUtils.wait_for_renderer();
	assert.ok(renderer);

	const file1 = COP.create_node('image');
	file1.p.url.set('/examples/textures/PavingStones.basis');

	let container, texture;

	container = await file1.request_container();
	assert.ok(!file1.states.error.message);
	texture = container.texture();
	assert.equal(texture.image.width, 2048);
	assert.equal(texture.image.height, 2048);

	RendererUtils.dispose();
});

QUnit.test('COP image simple hdr', async (assert) => {
	const COP = window.COP;

	const file1 = COP.create_node('image');
	file1.p.url.set('/examples/textures/equirectangular/spot1Lux.hdr');

	let container, texture;

	container = await file1.request_container();
	assert.ok(!file1.states.error.message);
	texture = container.texture();
	assert.equal(texture.image.width, 1024);
	assert.equal(texture.image.height, 512);
});

QUnit.skip('COP refers a path in another node', async (assert) => {
	// check that the graph is set correctly, but changing the referred path
});
