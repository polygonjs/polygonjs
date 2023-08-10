import type {QUnit} from '../../../helpers/QUnit';
import {SRGBColorSpace, ACESFilmicToneMapping, WebGLRenderer} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {BackgroundMode} from '../../../../src/engine/nodes/manager/utils/Scene/Background';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodescopCubeCamera(qUnit: QUnit) {
	qUnit.test('cop/cubeCamera simple', async (assert) => {
		const perspective_camera1 = window.perspective_camera1;
		const scene = window.scene;
		const geo1 = window.geo1;
		const geo2 = scene.createNode('geo');
		await scene.waitForCooksCompleted();

		// setup scene background
		scene.root().p.backgroundMode.set(BackgroundMode.COLOR);
		scene.root().p.bgColor.set([1, 0.5, 0.25]);

		// setup renderer
		const cameraNode = geo2.createNode('cubeCamera');
		cameraNode.p.resolution.set(16);
		cameraNode.p.position.y.set(1);
		cameraNode.flags.display.set(true);
		await cameraNode.compute();

		// ensure cube camera is mounted
		await CoreSleep.sleep(50);

		// create a renderer first
		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (options) => {
			const renderer = options.renderer!;
			if (!(renderer instanceof WebGLRenderer)) {
				assert.equal(1, 2, 'renderer is not a WebGLRenderer');
				return;
			}

			assert.ok(renderer, 'ok renderer');
			assert.equal(renderer.toneMapping, ACESFilmicToneMapping, 'tonemapping');
			assert.equal(renderer.outputColorSpace, SRGBColorSpace, 'colorspace');

			// setup scene
			scene.createNode('ambientLight');
			const text = geo1.createNode('text');
			text.p.text.set('TEST');
			const transform1 = geo1.createNode('transform');
			const transform2 = geo1.createNode('transform');
			transform1.setInput(0, text);
			transform2.setInput(0, transform1);
			transform1.p.t.set(['-$CEX', '-$CEY', '-$CEZ']);
			transform2.p.t.set([2, 0, 2]);
			transform2.flags.display.set(true);
			await transform1.compute();
			await CoreSleep.sleep(100);

			// start test
			const COP = window.COP;
			const cubeCamera1 = COP.createNode('cubeCamera');
			// render1.p.useDataTexture.set(1);
			cubeCamera1.p.cameraPath.set(`*cubeCamera1`);

			let container = await cubeCamera1.compute();
			assert.ok(!cubeCamera1.states.error.message());
			let texture = container.texture();
			assert.equal(texture.source.data.length, 6);
			assert.equal(texture.source.data[0].width, 16);
			assert.equal(texture.source.data[0].height, 16);
			cubeCamera1.p.render.pressButton();

			const renderTarget = cubeCamera1.renderTarget()!;
			assert.ok(renderTarget, 'ok renderTarget');
			// const bufferWidth = 16;
			// const bufferHeight = 16;
			// console.log(renderTarget);
			// const pixelBuffer = new Float32Array(bufferWidth * bufferHeight * 4);
			// renderer.readRenderTargetPixels(renderTarget, 0, 0, bufferWidth, bufferHeight, pixelBuffer);
			// console.log(pixelBuffer);
			// assert.in_delta(pixelBuffer[0], 0, 0.02, 'no bg');
			// assert.in_delta(pixelBuffer[1], 0, 0.02);
			// assert.in_delta(pixelBuffer[2], 0, 0.02);

			// assert.in_delta(pixelBuffer[300], 0.318, 0.02);
			// assert.in_delta(pixelBuffer[303], 1, 0.02);
			// assert.in_delta(pixelBuffer[304], 0.1591, 0.02);
			// assert.in_delta(pixelBuffer[307], 0.5, 0.02);
		});
	});
}
