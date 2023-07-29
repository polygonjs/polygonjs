import type {QUnit} from '../../../helpers/QUnit';
import {WebGLRenderer} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {roundPixelBuffer} from './particlesSystemGPU/ParticlesHelper';
export function testenginenodessopContactShadows(qUnit: QUnit) {

qUnit.test('sop/contactShadows simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.set([0, 2, 10]);

	scene.root().p.bgColor.set([1, 1, 1]);
	const sphere1 = geo1.createNode('sphere');
	const transform1 = geo1.createNode('transform');
	const plane1 = geo1.createNode('plane');
	const contactShadows1 = geo1.createNode('contactShadows');
	const transform2 = geo1.createNode('transform');
	const merge1 = geo1.createNode('merge');

	transform1.setInput(0, sphere1);
	contactShadows1.setInput(0, plane1);
	transform2.setInput(0, contactShadows1);
	merge1.setInput(0, transform1);
	merge1.setInput(1, transform2);

	merge1.flags.display.set(true);
	transform1.p.t.set([0, 1.5, 0]);
	plane1.p.size.set([2, 2]);

	contactShadows1.p.shadowRes.set([2, 2]);
	const w = contactShadows1.pv.shadowRes.x;
	const h = contactShadows1.pv.shadowRes.y;

	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(100);

		const renderer = viewer.renderer() as WebGLRenderer;
		assert.ok(renderer, 'renderer');
		const controller = contactShadows1.lastContactShadowsController()!;
		assert.ok(controller, 'controller');
		const renderTarget = controller.renderTarget;

		const pixelBuffer = new Uint8Array(w * h * 4);
		renderer.readRenderTargetPixels(renderTarget, 0, 0, w, h, pixelBuffer);
		assert.deepEqual(roundPixelBuffer(pixelBuffer), '0:0:0:57:0:0:0:57:0:0:0:57:0:0:0:57', 'point moved up');
	});
});

}