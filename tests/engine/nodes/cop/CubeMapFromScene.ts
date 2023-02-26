import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('cop/cubeMapFromScene simple', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	assert.ok(renderer);

	// start test
	const COP = window.COP;
	const cubeMapFromScene1 = COP.createNode('cubeMapFromScene');

	const sphere1 = cubeMapFromScene1.createNode('sphere');
	const material1 = cubeMapFromScene1.createNode('material');
	const materialsNetwork = cubeMapFromScene1.createNode('materialsNetwork');
	const meshBasic1 = materialsNetwork.createNode('meshBasic');

	meshBasic1.p.doubleSided.set(true);
	meshBasic1.p.color.set([0.25, 0.5, 0.75]);
	sphere1.p.radius.set(10);
	material1.setInput(0, sphere1);
	material1.p.material.setNode(meshBasic1);
	material1.flags.display.set(true);

	let container = await cubeMapFromScene1.compute();
	assert.ok(!cubeMapFromScene1.states.error.active());
	let texture = container.coreContent();
	const uuid1 = texture.uuid;
	assert.ok(texture.isRenderTargetTexture);
	assert.equal(texture.source.data.length, undefined);
	assert.equal(texture.source.data.width, 768);
	assert.equal(texture.source.data.height, 1024);
	assert.equal(texture.source.data.depth, 1);
	const bufferWidth = 1;
	const bufferHeight = 1;
	let pixelBuffer = new Uint16Array(bufferWidth * bufferHeight * 4);
	let lastRenderTarget = cubeMapFromScene1.lastGeneratedRenderTarget();
	assert.ok(lastRenderTarget);
	const sampleCoord = {
		x: 0, //texture.source.data.width - 1,
		y: 0, //texture.source.data.height - 1,
	};
	renderer.readRenderTargetPixels(
		lastRenderTarget!,
		sampleCoord.x,
		sampleCoord.y,
		bufferWidth,
		bufferHeight,
		pixelBuffer
	);
	assert.deepEqual(pixelBuffer.join(':'), [13312, 14336, 14848, 15360].join(':'), 'start values');

	sphere1.p.radius.set(sphere1.pv.radius + 1);
	container = await cubeMapFromScene1.compute();
	assert.ok(!cubeMapFromScene1.states.error.active());
	texture = container.coreContent();
	lastRenderTarget = cubeMapFromScene1.lastGeneratedRenderTarget();
	assert.ok(lastRenderTarget);
	renderer.readRenderTargetPixels(
		lastRenderTarget!,
		sampleCoord.x,
		sampleCoord.y,
		bufferWidth,
		bufferHeight,
		pixelBuffer
	);
	assert.deepEqual(pixelBuffer.join(':'), [13312, 14336, 14848, 15360].join(':'), 'no changes');

	const uuid2 = texture.uuid;
	assert.notEqual(uuid1, uuid2);

	meshBasic1.p.color.set([0.75, 0.3, 1]);
	await meshBasic1.compute();
	await cubeMapFromScene1.p.render.pressButton();
	container = await cubeMapFromScene1.compute();
	assert.ok(!cubeMapFromScene1.states.error.active());
	texture = container.coreContent();
	const uuid3 = texture.uuid;
	assert.notEqual(uuid2, uuid3);
	lastRenderTarget = cubeMapFromScene1.lastGeneratedRenderTarget();
	assert.ok(lastRenderTarget);
	renderer.readRenderTargetPixels(
		lastRenderTarget!,
		sampleCoord.x,
		sampleCoord.y,
		bufferWidth,
		bufferHeight,
		pixelBuffer
	);
	assert.deepEqual(pixelBuffer.join(':'), [14848, 13516, 15360, 15360].join(':'), ' changes');

	RendererUtils.dispose();
});
