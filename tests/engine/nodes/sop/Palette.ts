import {PolyScene} from '../../../../src/engine/scene/PolyScene';

QUnit.test('palette simple', async (assert) => {
	const scene = new PolyScene();
	const geo1 = scene.root().createNode('geo');

	const plane = geo1.createNode('plane');
	const scatter = geo1.createNode('scatter');
	const palette = geo1.createNode('palette');
	scatter.p.pointsCount.set(4);
	scatter.setInput(0, plane);
	palette.setInput(0, plane);
	palette.p.palette.set(1);

	let container = await palette.compute();
	let coreContent = container.coreContent()!;
	assert.ok(coreContent);
	let geometry = coreContent.objectsWithGeo()[0].geometry;
	let colorAttribArray = geometry.getAttribute('color').array;
	const delta = 0.05;
	assert.in_delta(colorAttribArray[0], 1, delta);
	assert.in_delta(colorAttribArray[1], 0.09084171056747437, delta);
	assert.in_delta(colorAttribArray[2], 0, delta);
	assert.in_delta(colorAttribArray[3], 0.9046611785888672, delta);
	assert.in_delta(colorAttribArray[4], 0.533276379108429, delta);
	assert.in_delta(colorAttribArray[5], 0.05951123684644699, delta);
	assert.in_delta(colorAttribArray[6], 0.006995410192757845, delta);
	assert.in_delta(colorAttribArray[7], 0.06301001459360123, delta);
	assert.in_delta(colorAttribArray[8], 0.006995410192757845, delta);
	assert.in_delta(colorAttribArray[9], 0.028426039963960648, delta);
	assert.in_delta(colorAttribArray[10], 0.0012141079641878605, delta);
	assert.in_delta(colorAttribArray[11], 0.9734452962875366, delta);

	palette.p.palette.set(2);
	container = await palette.compute();
	coreContent = container.coreContent()!;
	assert.ok(coreContent);
	geometry = coreContent.objectsWithGeo()[0].geometry;
	colorAttribArray = geometry.getAttribute('color').array;

	assert.in_delta(colorAttribArray[0], 0.9046611785888672, delta);
	assert.in_delta(colorAttribArray[1], 0.0003035269910469651, delta);
	assert.in_delta(colorAttribArray[2], 0.0012141079641878605, delta);
	assert.in_delta(colorAttribArray[3], 0.9215818643569946, delta);
	assert.in_delta(colorAttribArray[4], 0.5271151065826416, delta);
	assert.in_delta(colorAttribArray[5], 0.4507857859134674, delta);
	assert.in_delta(colorAttribArray[6], 0.31854677200317383, delta);
	assert.in_delta(colorAttribArray[7], 0.13563333451747894, delta);
	assert.in_delta(colorAttribArray[8], 0.0423114113509655, delta);
	assert.in_delta(colorAttribArray[9], 0.8713670969009399, delta);
	assert.in_delta(colorAttribArray[10], 0.8796223998069763, delta);
	assert.in_delta(colorAttribArray[11], 0.9046611785888672, delta);
});
