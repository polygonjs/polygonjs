import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {RenderPass, KawaseBlurPass, BloomEffect, EffectPass} from 'postprocessing';
import {ThreejsViewer} from '../../../../src/engine/viewers/Threejs';
export function testenginenodespostBase(qUnit: QUnit) {
qUnit.test('Post nodes simple', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	assert.ok(renderer);

	// start test
	const camera = scene.root().nodesByType('perspectiveCamera')[0];
	const post_process1 = camera.createNode('postProcessNetwork');
	const blur1 = post_process1.createNode('blur');

	assert.ok(blur1.flags?.display?.active(), 'first node created has display flag on');

	camera.p.doPostProcess.set(1);
	camera.p.postProcessNode.set(post_process1.path());
	await CoreSleep.sleep(20);

	// 2 passes by default
	await RendererUtils.withViewer({cameraNode: camera}, async (args) => {
		const {viewer} = args;
		const composer = (viewer as ThreejsViewer<any>).effectComposer()!;
		assert.ok(composer, 'composer exists');
		assert.equal(composer.passes.length, 2, 'composer has two passes');
		assert.ok(composer.passes[0] instanceof RenderPass);
		assert.ok(composer.passes[1] instanceof KawaseBlurPass);
	});

	// 1 pass if no prepend
	post_process1.p.prependRenderPass.set(0);
	await CoreSleep.sleep(20);
	await RendererUtils.withViewer({cameraNode: camera}, async (args) => {
		const {viewer} = args;
		const composer = (viewer as ThreejsViewer<any>).effectComposer()!;
		assert.ok(composer, 'composer exists');
		assert.equal(composer.passes.length, 1, 'composer has one pass (1)');
		assert.ok(composer.passes[0] instanceof KawaseBlurPass);
	});

	// add another pass and add as input to the first one
	const blur2 = post_process1.createNode('blur');
	blur1.setInput(0, blur2);
	await CoreSleep.sleep(20);
	await RendererUtils.withViewer({cameraNode: camera}, async (args) => {
		const {viewer} = args;
		const composer = (viewer as ThreejsViewer<any>).effectComposer()!;
		assert.equal(composer.passes.length, 2, 'composer has two passes (2)');
		assert.ok(composer.passes[0] instanceof KawaseBlurPass);
		assert.ok(composer.passes[1] instanceof KawaseBlurPass);
	});

	// add another and set the display flag to it
	const bloom1 = post_process1.createNode('bloom');
	bloom1.flags.display.set(true);
	await RendererUtils.withViewer({cameraNode: camera}, async (args) => {
		const {viewer} = args;
		const composer = (viewer as ThreejsViewer<any>).effectComposer()!;
		assert.equal(composer.passes.length, 1, 'composer has one pass (2)');
		assert.ok(composer.passes[0] instanceof EffectPass);
		assert.ok((composer.passes[0] as any).effects[0] instanceof BloomEffect);
	});

	// change display flag again
	blur2.flags.display.set(true);
	await RendererUtils.withViewer({cameraNode: camera}, async (args) => {
		const {viewer} = args;
		const composer = (viewer as ThreejsViewer<any>).effectComposer()!;
		assert.equal(composer.passes.length, 1, 'composer has one pass (3)');
		assert.ok(composer.passes[0] instanceof KawaseBlurPass);
	});

	// change display flag again
	blur1.flags.display.set(true);
	await RendererUtils.withViewer({cameraNode: camera}, async (args) => {
		const {viewer} = args;
		const composer = (viewer as ThreejsViewer<any>).effectComposer()!;
		assert.equal(composer.passes.length, 2, 'composer has two passes (3)');
		assert.ok(composer.passes[0] instanceof KawaseBlurPass);
		assert.ok(composer.passes[1] instanceof KawaseBlurPass);
	});

	RendererUtils.dispose();
});

}