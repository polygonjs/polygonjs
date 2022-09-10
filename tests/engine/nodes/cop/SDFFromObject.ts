import {SDFDataContainer} from '../../../../src/core/loader/geometry/SDF';

QUnit.test('cop/SDFFromObject simple', async (assert) => {
	const scene = window.scene;

	// create geometry
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);

	// create sdf
	const COP = scene.createNode('copNetwork');
	const SDFFromObject = COP.createNode('SDFFromObject');

	SDFFromObject.p.voxelSize.set(0.1);
	SDFFromObject.p.geometry.setNode(transform1);
	const container = await SDFFromObject.compute();
	const texture = container.texture();
	const data = texture.source.data as SDFDataContainer;
	assert.equal(data.width, 14);
	assert.equal(data.height, 14);
	assert.equal(data.depth, 14);
	assert.equal(data.data.length, 2744);
	assert.in_delta(data.boundMinx, -0.7, 0.01);
	assert.in_delta(data.boundMiny, -0.7, 0.01);
	assert.in_delta(data.boundMinz, -0.7, 0.01);
	assert.in_delta(data.boundMaxx, 0.7, 0.01);
	assert.in_delta(data.boundMaxy, 0.7, 0.01);
	assert.in_delta(data.boundMaxz, 0.7, 0.01);

	assert.deepEqual(SDFFromObject.p.boundMin.value.toArray(), [-0.7, -0.7, -0.7]);
	assert.deepEqual(SDFFromObject.p.boundMax.value.toArray(), [0.7, 0.7, 0.7]);
	assert.deepEqual(SDFFromObject.p.resolution.value.toArray(), [14, 14, 14]);

	// test shader with params linked to cop node
});

QUnit.test('cop/SDFFromObject with hierarchy', async (assert) => {
	assert.equal(1, 2);
});
QUnit.test('cop/SDFFromObject with hierarchy and scale', async (assert) => {
	assert.equal(1, 2);
});
