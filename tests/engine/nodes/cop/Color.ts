import {DataTexture} from 'three/src/textures/DataTexture';

QUnit.test('cop/color simple', async (assert) => {
	const COP = window.COP;
	const color = COP.createNode('color');

	color.p.color.set([1, 0.5, 0.25]);
	let container = await color.compute();
	let texture = container.coreContent() as DataTexture;
	let data = texture.image.data;
	assert.equal(data[0], 255);
	assert.equal(data[1], 127);
	assert.equal(data[2], 63);
	assert.equal(data[3], 255);

	color.p.color.set([0.1, 0.2, 0.4]);
	await color.compute();
	assert.equal(data[0], 25);
	assert.equal(data[1], 51);
	assert.equal(data[2], 102);
	assert.equal(data[3], 255);
});
