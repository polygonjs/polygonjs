import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('COP render simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	await scene.waitForCooksCompleted();

	// create a renderer first
	const {renderer} = await RendererUtils.waitForRenderer(scene);
	assert.ok(renderer);

	// setup scene
	scene.createNode('ambientLight');
	const text = geo1.createNode('text');
	text.p.text.set('TEST');
	const transform = geo1.createNode('transform');
	transform.setInput(0, text);
	transform.p.t.set(['-$CEX', '-$CEY', '-$CEZ']);
	transform.flags.display.set(true);
	await transform.compute();
	await CoreSleep.sleep(100);
	const camera = scene.createNode('orthographicCamera');
	camera.p.t.z.set(4);

	// start test
	const COP = window.COP;
	const render1 = COP.createNode('render');
	render1.p.useCameraRenderer.set(0);
	render1.p.resolution.set([16, 16]);
	render1.p.camera.setNode(camera);

	let container = await render1.compute();
	assert.ok(!render1.states.error.message());
	let texture = container.texture();
	assert.equal(texture.image.width, 16);
	assert.equal(texture.image.height, 16);
	render1.p.render.pressButton();

	const render_target = await render1.renderTarget();
	const buffer_width = 16;
	const buffer_height = 16;
	const pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.in_delta(pixelBuffer[0], 0.39, 0.02);

	RendererUtils.dispose();
});
