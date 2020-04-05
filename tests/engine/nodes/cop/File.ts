import {Vector2} from 'three/src/math/Vector2';
import {Poly} from '../../../../src/engine/Poly';

QUnit.test('COP file simple default', async (assert) => {
	const COP = window.COP;

	const file1 = COP.create_node('file');

	let container, texture;

	container = await file1.request_container();
	assert.ok(!file1.states.error.message);
	texture = container.texture();
	assert.equal(texture.image.width, 512);
	assert.equal(texture.image.height, 512);
});

QUnit.test('COP file simple with bad path', async (assert) => {
	const COP = window.COP;

	const file1 = COP.create_node('file');
	file1.p.url.set('/doesnotexists.jpg');

	// let container, texture;

	/*container = */ await file1.request_container();
	assert.equal(file1.states.error.message, "could not load texture '/doesnotexists.jpg'");
	// texture = container.texture();
	// assert.equal(texture.image.width, 512);
	// assert.equal(texture.image.height, 512);
});

QUnit.test('COP file simple exr', async (assert) => {
	const COP = window.COP;

	const file1 = COP.create_node('file');
	file1.p.url.set('/examples/textures/piz_compressed.exr');

	let container, texture;

	container = await file1.request_container();
	assert.ok(!file1.states.error.message);
	texture = container.texture();
	assert.equal(texture.image.width, 1024);
	assert.equal(texture.image.height, 512);
});

QUnit.test('COP file simple basis', async (assert) => {
	const COP = window.COP;

	// create renderer for basis loader
	const canvas = document.createElement('canvas');
	document.body.appendChild(canvas);
	const size = new Vector2(canvas.width, canvas.height);
	window.perspective_camera1.render_controller.create_renderer(canvas, size);
	const renderer = await Poly.instance().renderers_controller.wait_for_renderer();
	assert.ok(renderer);

	const file1 = COP.create_node('file');
	file1.p.url.set('/examples/textures/PavingStones.basis');

	let container, texture;

	container = await file1.request_container();
	assert.ok(!file1.states.error.message);
	texture = container.texture();
	assert.equal(texture.image.width, 2048);
	assert.equal(texture.image.height, 2048);

	document.body.removeChild(canvas);
});

QUnit.test('COP file simple hdr', async (assert) => {
	const COP = window.COP;

	const file1 = COP.create_node('file');
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
