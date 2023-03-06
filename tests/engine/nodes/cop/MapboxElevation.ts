import {Box3} from 'three';
const tmpBox = new Box3();
QUnit.test('cop/mapboxElevation simple', async (assert) => {
	const scene = window.scene;
	const geo1 = scene.root().createNode('geo');
	const COP = scene.root().createNode('copNetwork');

	const mapboxElevation1 = COP.createNode('mapboxElevation');
	mapboxElevation1.p.longitude.set(6.652151);
	mapboxElevation1.p.latitude.set(45.8854421);
	mapboxElevation1.p.zoom.set(11);
	mapboxElevation1.p.updateRange.set(1);
	mapboxElevation1.p.min.set(0);
	mapboxElevation1.p.highres.set(10);

	const plane1 = geo1.createNode('plane');
	const heightMap1 = geo1.createNode('heightMap');

	heightMap1.setInput(0, plane1);
	heightMap1.p.texture.setNode(mapboxElevation1);
	heightMap1.p.mult.set(100);

	await mapboxElevation1.compute();
	const container = await heightMap1.compute();
	container.boundingBox(tmpBox);
	assert.equal(tmpBox.min.x, -0.5);
	assert.equal(tmpBox.max.x, 0.5);
	assert.equal(tmpBox.min.z, -0.5);
	assert.equal(tmpBox.max.z, 0.5);
	assert.in_delta(tmpBox.min.y, 9.654235, 0.2);
	assert.in_delta(tmpBox.max.y, 21.41265, 0.2);
});
