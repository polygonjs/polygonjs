import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
console.log(ASSETS_ROOT);

QUnit.test('COP audioAnalyzer with FFT', async (assert) => {
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

	await CoreSleep.sleep(1000);

	const COP = window.COP;
	const audioAnalyzer = COP.createNode('audioAnalyzer');
	audioAnalyzer.p.audioAnalyzerNode.setNode(FFT);

	let container = await audioAnalyzer.compute();
	assert.ok(!audioAnalyzer.states.error.message());
	let texture = container.texture();
	assert.equal(texture.image.width, 256);
	assert.deepEqual(container.resolution(), [256, 1]);
	assert.in_delta(texture.image.data[0], 50, 20);

	null1.setInput(0, null);
});

QUnit.test('COP audioAnalyzer with Meter', async (assert) => {
	const scene = window.scene;

	scene.root().createNode('audioListener');
	const audioUrl = `${ASSETS_ROOT}/audio/Thrystero_Diagonal-160.ogg`;
	const positionalAudio = scene.root().createNode('positionalAudio');
	const file = positionalAudio.createNode('file');
	file.p.url.set(audioUrl);
	const meter = positionalAudio.createNode('meter');
	const null1 = positionalAudio.createNode('null');
	null1.setInput(0, meter);
	meter.setInput(0, file);
	positionalAudio.p.audioNode.setNode(null1);

	await CoreSleep.sleep(1000);

	const COP = window.COP;
	const audioAnalyzer = COP.createNode('audioAnalyzer');
	audioAnalyzer.p.audioAnalyzerNode.setNode(meter);

	let container = await audioAnalyzer.compute();
	assert.ok(!audioAnalyzer.states.error.message());
	let texture = container.texture();
	assert.equal(texture.image.width, 1);
	assert.deepEqual(container.resolution(), [1, 1]);
	assert.in_delta(texture.image.data[0], 92, 20);

	null1.setInput(0, null);
});

QUnit.test('COP audioAnalyzer with Waveform', async (assert) => {
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

	await CoreSleep.sleep(1000);

	const COP = window.COP;
	const audioAnalyzer = COP.createNode('audioAnalyzer');
	audioAnalyzer.p.audioAnalyzerNode.setNode(waveform);
	audioAnalyzer.p.decibelRange.set([-0.25, 0.25]);

	let container = await audioAnalyzer.compute();
	assert.ok(!audioAnalyzer.states.error.message());
	let texture = container.texture();
	assert.equal(texture.image.width, 256);
	assert.deepEqual(container.resolution(), [256, 1]);
	assert.in_delta(texture.image.data[0], 169, 20);
	assert.in_delta(texture.image.data[100], 158, 20);
	assert.notEqual(texture.image.data[0], texture.image.data[20]);

	null1.setInput(0, null);
});
