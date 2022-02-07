import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('COP audioAnalyser with FFT', async (assert) => {
	const scene = window.scene;

	scene.root().createNode('audioListener');
	const audioUrl = `${ASSETS_ROOT}/audio/Thrystero_Diagonal-160.ogg`;
	const positionalAudio = scene.root().createNode('positionalAudio');
	const file = positionalAudio.createNode('file');
	file.p.url.set(audioUrl);
	const FFT = positionalAudio.createNode('FFT');
	const null1 = positionalAudio.createNode('null');
	null1.setInput(0, FFT);
	FFT.setInput(0, file);
	positionalAudio.p.audioNode.setNode(null1);

	const COP = window.COP;
	const audioAnalyser = COP.createNode('audioAnalyser');
	audioAnalyser.p.activeR.set(1);
	audioAnalyser.p.audioNodeR.setNode(FFT);

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		if (!(FFT && file && null1 && audioAnalyser && positionalAudio)) {
			assert.equal(1, 2, 'nodes not created');
			return;
		}
		assert.equal(scene.frame(), 0);
		assert.equal(scene.time(), 0);
		scene.play();

		await CoreSleep.sleep(1000);
		assert.notEqual(scene.frame(), 0);
		assert.notEqual(scene.time(), 0);

		let container = await audioAnalyser.compute();
		assert.ok(!audioAnalyser.states.error.message());
		let texture = container.texture();
		assert.equal(texture.image.width, 1024);
		assert.deepEqual(container.resolution(), [1024, 2]);
		let sum = 0;
		for (let i = 0; i < texture.image.width; i++) {
			sum += texture.image.data[i * 4 + 0];
		}
		assert.in_delta(sum, 0.13, 0.12);

		null1.setInput(0, null);

		scene.pause();
	});

	null1.setInput(0, null);
});

QUnit.test('COP audioAnalyser with FFT as octaves', async (assert) => {
	const scene = window.scene;

	scene.root().createNode('audioListener');
	const audioUrl = `${ASSETS_ROOT}/audio/Thrystero_Diagonal-160.ogg`;
	const positionalAudio = scene.root().createNode('positionalAudio');
	const file = positionalAudio.createNode('file');
	file.p.url.set(audioUrl);
	const FFT = positionalAudio.createNode('FFT');
	const null1 = positionalAudio.createNode('null');
	null1.setInput(0, FFT);
	FFT.setInput(0, file);
	FFT.p.asOctaves.set(1);
	positionalAudio.p.audioNode.setNode(null1);

	const COP = window.COP;
	const audioAnalyser = COP.createNode('audioAnalyser');
	audioAnalyser.p.activeR.set(1);
	audioAnalyser.p.audioNodeR.setNode(FFT);

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		if (!(FFT && file && null1 && audioAnalyser && positionalAudio)) {
			assert.equal(1, 2, 'nodes not created');
			return;
		}
		assert.equal(scene.frame(), 0);
		assert.equal(scene.time(), 0);
		scene.play();

		await CoreSleep.sleep(1000);
		assert.notEqual(scene.frame(), 0);
		assert.notEqual(scene.time(), 0);

		let container = await audioAnalyser.compute();
		assert.ok(!audioAnalyser.states.error.message());
		let texture = container.texture();
		assert.equal(texture.image.width, 10);
		assert.deepEqual(container.resolution(), [10, 2]);
		let sum = 0;
		for (let i = 0; i < texture.image.width; i++) {
			sum += texture.image.data[i * 4 + 0];
		}
		assert.in_delta(sum, 0.15, 0.14);

		null1.setInput(0, null);

		scene.pause();
	});

	null1.setInput(0, null);
});

QUnit.test('COP audioAnalyser with Meter', async (assert) => {
	const scene = window.scene;

	const listener = scene.root().createNode('audioListener');
	listener.setInput(0, window.perspective_camera1);
	const audioUrl = `${ASSETS_ROOT}/audio/497848__amaida1__helicopter-sound.ogg`;
	const positionalAudio = scene.root().createNode('positionalAudio');
	const file = positionalAudio.createNode('file');
	file.p.url.set(audioUrl);
	const meter = positionalAudio.createNode('meter');
	const null1 = positionalAudio.createNode('null');
	meter.setInput(0, file);
	null1.setInput(0, meter);
	meter.p.updateRangeParam.set(1);
	positionalAudio.p.audioNode.setNode(null1);

	const COP = window.COP;
	const audioAnalyser = COP.createNode('audioAnalyser');
	audioAnalyser.p.activeR.set(1);
	audioAnalyser.p.audioNodeR.setNode(meter);

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		if (!(meter && file && null1 && audioAnalyser && positionalAudio)) {
			assert.equal(1, 2, 'nodes not created');
			return;
		}
		assert.equal(scene.frame(), 0);
		assert.equal(scene.time(), 0);
		scene.play();

		await CoreSleep.sleep(1000);
		assert.notEqual(scene.frame(), 0);
		assert.notEqual(scene.time(), 0);

		let container = await audioAnalyser.compute();
		assert.ok(!file.states.error.message());
		assert.ok(!meter.states.error.message());
		assert.ok(!null1.states.error.message());
		assert.ok(!positionalAudio.states.error.message());
		assert.ok(!audioAnalyser.states.error.message());
		let texture = container.texture();
		assert.equal(texture.image.width, 1);
		assert.deepEqual(container.resolution(), [1, 2]);
		assert.in_delta(texture.image.data[0], 0.4, 0.3);

		null1.setInput(0, null);

		scene.pause();
	});
});

QUnit.test('COP audioAnalyser with Waveform', async (assert) => {
	const scene = window.scene;

	scene.root().createNode('audioListener');
	const audioUrl = `${ASSETS_ROOT}/audio/Thrystero_Diagonal-160.ogg`;
	const positionalAudio = scene.root().createNode('positionalAudio');
	const file = positionalAudio.createNode('file');
	file.p.url.set(audioUrl);
	const waveform = positionalAudio.createNode('waveform');
	const null1 = positionalAudio.createNode('null');
	null1.setInput(0, waveform);
	waveform.setInput(0, file);
	positionalAudio.p.audioNode.setNode(null1);

	const COP = window.COP;
	const audioAnalyser = COP.createNode('audioAnalyser');
	audioAnalyser.p.activeR.set(1);
	audioAnalyser.p.audioNodeR.setNode(waveform);
	// audioAnalyser.p.rangeR.set([-0.25, 0.25]);

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		if (!(waveform && file && null1 && audioAnalyser && positionalAudio)) {
			assert.equal(1, 2, 'nodes not created');
			return;
		}
		assert.equal(scene.frame(), 0);
		assert.equal(scene.time(), 0);
		scene.play();

		await CoreSleep.sleep(1000);
		assert.notEqual(scene.frame(), 0);
		assert.notEqual(scene.time(), 0);

		let container = await audioAnalyser.compute();
		assert.ok(!audioAnalyser.states.error.message());
		let texture = container.texture();
		assert.equal(texture.image.width, 1024);
		assert.deepEqual(container.resolution(), [1024, 2]);
		let sum = 0;
		for (let i = 0; i < texture.image.width; i++) {
			sum += texture.image.data[i * 4 + 0];
		}
		assert.in_delta(sum, 1000, 800);

		null1.setInput(0, null);
		scene.pause();
	});
});
