import type {QUnit} from '../../../helpers/QUnit';
import {LinearSRGBColorSpace, NoToneMapping, WebGLRenderer} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {BackgroundMode} from '../../../../src/engine/nodes/manager/utils/Scene/Background';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodescopRender(qUnit: QUnit) {
	qUnit.test('cop/render simple', async (assert) => {
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
		webglRendererNode.p.outputColorSpace.set(LinearSRGBColorSpace);
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
			assert.equal(renderer.outputColorSpace, LinearSRGBColorSpace);

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
			// render1.p.useDataTexture.set(1);
			render1.p.useRendererRes.set(0);
			render1.p.resolution.set([16, 16]);
			render1.p.cameraPath.set(`*${camera.object.name}`);
			render1.p.tcolorSpace.set(true);
			render1.p.colorSpace.set(LinearSRGBColorSpace);

			let container = await render1.compute();
			assert.ok(!render1.states.error.message());
			let texture = container.texture();
			assert.equal(texture.image.width, 16);
			assert.equal(texture.image.height, 16);
			render1.p.render.pressButton();

			const renderTarget = await render1.renderTarget(renderer);
			const bufferWidth = 16;
			const bufferHeight = 16;
			const pixelBuffer = new Float32Array(bufferWidth * bufferHeight * 4);
			renderer.readRenderTargetPixels(renderTarget, 0, 0, bufferWidth, bufferHeight, pixelBuffer);
			assert.in_delta(pixelBuffer[0], 0, 0.02, 'no bg');
			assert.in_delta(pixelBuffer[1], 0, 0.02);
			assert.in_delta(pixelBuffer[2], 0, 0.02);

			assert.in_delta(pixelBuffer[300], 0.318, 0.02);
			assert.in_delta(pixelBuffer[303], 1, 0.02);
			assert.in_delta(pixelBuffer[304], 0.1591, 0.02);
			assert.in_delta(pixelBuffer[307], 0.5, 0.02);
		});
	});
}
