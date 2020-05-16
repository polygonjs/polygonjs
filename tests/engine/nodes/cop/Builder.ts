import {Poly} from '../../../../src/engine/Poly';
import {Vector2} from 'three/src/math/Vector2';
import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('COP builder simple with render target', async (assert) => {
	const scene = window.scene;
	await scene.wait_for_cooks_completed();

	// create a renderer first
	const canvas = document.createElement('canvas');
	document.body.appendChild(canvas);
	const size = new Vector2(canvas.width, canvas.height);
	const viewer = window.perspective_camera1.render_controller.create_renderer(canvas, size);
	const renderer = await Poly.instance().renderers_controller.wait_for_renderer();
	assert.ok(renderer);

	// start test
	const COP = window.COP;
	// const MAT = window.MAT
	const builder1 = COP.create_node('builder');
	builder1.p.use_camera_renderer.set(1);
	// currently no need to tie it to a material to have it recook
	// currently use a mat to have the builder recook
	// const mesh_basic_builder1 = MAT.create_node('mesh_basic_builder')
	// mesh_basic_builder1.p.use_map.set(1)
	// mesh_basic_builder1.p.map.set(builder1.full_path())

	let container = await builder1.request_container();
	assert.ok(!builder1.states.error.message);
	let texture = container.texture();
	assert.equal(texture.image.width, 256);
	assert.equal(texture.image.height, 256);

	const render_target = builder1.render_target();
	const buffer_width = 1;
	const buffer_height = 1;
	const pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [0, 0, 0, 1].join(':'), 'black with alpha 1');

	const float_to_vec31 = builder1.create_node('float_to_vec3');
	const output1 = builder1.nodes_by_type('output')[0];
	const globals1 = builder1.nodes_by_type('globals')[0];
	output1.set_input('color', float_to_vec31);
	float_to_vec31.set_input('x', globals1, 'time');
	console.log(scene.loading_controller.is_loading);
	scene.set_frame(30);
	assert.equal(scene.time, 0.5);
	await CoreSleep.sleep(10);
	renderer.readRenderTargetPixels(render_target, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [0.5, 0, 0, 1].join(':'));

	scene.set_frame(60);
	assert.equal(scene.time, 1);
	await CoreSleep.sleep(10);
	renderer.readRenderTargetPixels(render_target, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [1.0, 0, 0, 1].join(':'));

	// remove viewer
	viewer.dispose();
	document.body.removeChild(canvas);
});

QUnit.test('COP builder simple with data texture', async (assert) => {
	const scene = window.scene;
	await scene.wait_for_cooks_completed();

	const COP = window.COP;
	const builder1 = COP.create_node('builder');
	// currently no need to tie it to a material to have it recook
	// currently use a mat to have the builder recook
	// const mesh_basic_builder1 = MAT.create_node('mesh_basic_builder')
	// mesh_basic_builder1.p.use_map.set(1)
	// mesh_basic_builder1.p.map.set(builder1.full_path())

	let container = await builder1.request_container();
	assert.ok(!builder1.states.error.message);
	let texture = container.texture();
	assert.equal(texture.image.width, 256);
	assert.equal(texture.image.height, 256);

	const pixelBuffer = texture.image.data;
	assert.deepEqual(pixelBuffer.slice(0, 4).join(':'), [0, 0, 0, 1].join(':'), 'black with alpha 1');

	const float_to_vec31 = builder1.create_node('float_to_vec3');
	const output1 = builder1.nodes_by_type('output')[0];
	const globals1 = builder1.nodes_by_type('globals')[0];
	output1.set_input('color', float_to_vec31);
	float_to_vec31.set_input('x', globals1, 'time');
	console.log(scene.loading_controller.is_loading);
	scene.set_frame(30);
	assert.equal(scene.time, 0.5);
	await CoreSleep.sleep(10);
	assert.deepEqual(pixelBuffer.slice(0, 4).join(':'), [0.5, 0, 0, 1].join(':'));

	scene.set_frame(60);
	assert.equal(scene.time, 1);
	await CoreSleep.sleep(10);
	assert.deepEqual(pixelBuffer.slice(0, 4).join(':'), [1.0, 0, 0, 1].join(':'));
});
