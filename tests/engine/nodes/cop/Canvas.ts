import {sRGBEncoding, WebGLRenderer} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('COP canvas simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const COP = window.COP;
	const MAT = window.MAT;
	await scene.waitForCooksCompleted();

	const camera = scene.createNode('orthographicCamera');
	camera.p.t.z.set(10);
	camera.p.size.set(1);
	// const ropNetwork = camera.createNode('renderersNetwork');
	// const webglRendererNode = ropNetwork.createNode('WebGLRenderer');
	// webglRendererNode.p.toneMapping.set(NoToneMapping);
	// webglRendererNode.p.outputEncoding.set(LinearEncoding);
	camera.p.setRenderer.set(true);
	// camera.p.renderer.setNode(webglRendererNode);
	await camera.compute();

	// create a renderer first
	await RendererUtils.withViewer({cameraNode: camera}, async (options) => {
		const renderer = options.renderer!;
		if (!(renderer instanceof WebGLRenderer)) {
			assert.equal(1, 2, 'renderer is not a WebGLRenderer');
			return;
		}

		assert.ok(renderer, 'ok renderer');
		// assert.equal(renderer.toneMapping, NoToneMapping);
		// assert.equal(renderer.outputEncoding, LinearEncoding);

		// setup scene
		const meshBasic = MAT.createNode('meshBasic');
		const sphere = geo1.createNode('sphere');
		const material = geo1.createNode('material');
		material.setInput(0, sphere);
		material.p.material.setNode(meshBasic);
		material.flags.display.set(true);
		meshBasic.p.color.set([1, 1, 1]);

		const render = COP.createNode('render');
		render.p.camera.setNode(camera);
		render.p.resolution.set([16, 16]);

		async function getRenderData() {
			if (!(renderer instanceof WebGLRenderer)) {
				assert.equal(1, 2, 'renderer is not a WebGLRenderer');
				return [-1];
			}
			render.p.render.pressButton();

			const render_target = await render.renderTarget();
			const buffer_width = 16;
			const buffer_height = 16;
			const pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
			renderer.readRenderTargetPixels(render_target, 0, 0, buffer_width, buffer_height, pixelBuffer);
			const result = [pixelBuffer[0], pixelBuffer[1], pixelBuffer[2]];
			// console.log(result);
			return result;
		}

		// create HTMLCanvas
		const canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
		const canvasId = 'canvas-test';
		canvas.id = canvasId;
		canvas.width = 128;
		canvas.height = 128;

		function setCanvasColor(color: string) {
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				return;
			}
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			// console.log(color);
			canvas1.p.update.pressButton();
		}

		// start test
		const canvas1 = COP.createNode('canvas');
		canvas1.p.canvasId.set(canvasId);
		canvas1.p.encoding.set(sRGBEncoding);
		meshBasic.p.useMap.set(true);
		meshBasic.p.map.setNode(canvas1);

		await canvas1.compute();

		function fireRender() {
			renderer.render(scene.threejsScene(), camera.object);
		}
		let requestId = -1;
		function animate() {
			requestId = requestAnimationFrame(animate);
			fireRender();
		}
		animate();
		const pauseDuration = 100;

		let data = await getRenderData();
		assert.in_delta(data[0], 0, 0.1, 'default');
		assert.in_delta(data[1], 0, 0.1, 'default');
		assert.in_delta(data[2], 0, 0.1, 'default');

		setCanvasColor('black');
		await CoreSleep.sleep(pauseDuration);
		data = await getRenderData();
		// the color of the root.backgroundColor seems to have an impact on this color, not sure why yet
		assert.in_delta(data[0], 0.02, 0.02, 'black');
		assert.in_delta(data[1], 0.02, 0.02, 'black');
		assert.in_delta(data[2], 0.02, 0.02), 'black';

		setCanvasColor('white');
		await CoreSleep.sleep(pauseDuration);
		// I'm not entirely sure why it is not white here (sRGB conversion maybe?)
		data = await getRenderData();
		assert.in_delta(data[0], 0.76, 0.1, 'white');
		assert.in_delta(data[1], 0.76, 0.1, 'white');
		assert.in_delta(data[2], 0.76, 0.1, 'white');

		setCanvasColor('red');
		await CoreSleep.sleep(pauseDuration);
		data = await getRenderData();
		assert.in_delta(data[0], 0.95, 0.1, 'red');
		assert.in_delta(data[1], 0, 0.1, 'red');
		assert.in_delta(data[2], 0, 0.1, 'red');

		setCanvasColor('blue');
		await CoreSleep.sleep(pauseDuration);
		data = await getRenderData();
		assert.in_delta(data[0], 0.0, 0.1, 'blue');
		assert.in_delta(data[1], 0, 0.1, 'blue');
		assert.in_delta(data[2], 0.77, 0.1, 'blue');

		setCanvasColor('green');
		await CoreSleep.sleep(pauseDuration);
		data = await getRenderData();
		assert.in_delta(data[0], 0.0, 0.1, 'green');
		assert.in_delta(data[1], 0.56, 0.1, 'green');
		assert.in_delta(data[2], 0.0, 0.1, 'green');

		setCanvasColor('purple');
		await CoreSleep.sleep(pauseDuration);
		data = await getRenderData();
		assert.in_delta(data[0], 0.59, 0.1, 'purple');
		assert.in_delta(data[1], 0, 0.1, 'purple');
		assert.in_delta(data[2], 0.54, 0.1, 'purple');

		canvas.parentElement?.removeChild(canvas);
		cancelAnimationFrame(requestId);
	});
});
