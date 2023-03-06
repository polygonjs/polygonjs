import {Box3} from 'three';
const tmpBox = new Box3();

QUnit.test('cop/mapboxSatellite simple', async (assert) => {
	const scene = window.scene;
	const geo1 = scene.root().createNode('geo');
	const COP = scene.root().createNode('copNetwork');

	const mapboxSatellite1 = COP.createNode('mapboxSatellite');
	const plane1 = geo1.createNode('plane');
	const heightMap1 = geo1.createNode('heightMap');

	heightMap1.setInput(0, plane1);
	heightMap1.p.texture.set(mapboxSatellite1.path());
	heightMap1.p.mult.set(100);

	await mapboxSatellite1.compute();
	const container = await heightMap1.compute();
	container.boundingBox(tmpBox);
	assert.equal(tmpBox.min.x, -0.5);
	assert.equal(tmpBox.max.x, 0.5);
	assert.equal(tmpBox.min.z, -0.5);
	assert.equal(tmpBox.max.z, 0.5);
	assert.in_delta(tmpBox.min.y, 400, 0.1);
	assert.in_delta(tmpBox.max.y, 400, 0.1);
});
