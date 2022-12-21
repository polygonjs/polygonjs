import {LinearEncoding, NoToneMapping, WebGLRenderer} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {BackgroundMode} from '../../../../src/engine/nodes/manager/utils/Scene/Background';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('COP render simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	await scene.waitForCooksCompleted();

	// setup scene background
	scene.root().p.backgroundMode.set(BackgroundMode.COLOR);
	scene.root().p.bgColor.set([1, 0.5, 0.25]);

	// setup renderer
	const camera = scene.createNode('orthographicCamera');
	camera.p.size.set(2);
	camera.p.t.z.set(4);
	const ropNetwork = camera.createNode('renderersNetwork');
	const webglRendererNode = ropNetwork.createNode('WebGLRenderer');
	webglRendererNode.p.toneMapping.set(NoToneMapping);
	webglRendererNode.p.outputEncoding.set(LinearEncoding);
	camera.p.setRenderer.set(true);
	camera.p.renderer.setNode(webglRendererNode);
	await camera.compute();

	// create a renderer first
	await RendererUtils.withViewer({cameraNode: camera}, async (options) => {
		const renderer = options.renderer!;
		if (!(renderer instanceof WebGLRenderer)) {
			assert.equal(1, 2, 'renderer is not a WebGLRenderer');
			return;
		}

		assert.ok(renderer);
		assert.equal(renderer.toneMapping, NoToneMapping);
		assert.equal(renderer.outputEncoding, LinearEncoding);

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

		// start test
		const COP = window.COP;
		const render1 = COP.createNode('render');
		render1.p.useDataTexture.set(1);
		render1.p.resolution.set([16, 16]);
		render1.p.camera.setNode(camera);
		render1.p.tencoding.set(true);
		render1.p.encoding.set(LinearEncoding);

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
		assert.in_delta(pixelBuffer[0], 1, 0.02);
		assert.in_delta(pixelBuffer[1], 0.21, 0.02);
		assert.in_delta(pixelBuffer[2], 0.05, 0.02);
	});
});
