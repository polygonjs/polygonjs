import {Mesh} from 'three/src/objects/Mesh';

QUnit.test('BVHVisualizer simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const sphere1 = geo1.createNode('sphere');
	const BVH1 = geo1.createNode('BVH');
	const BVHVisualizer1 = geo1.createNode('BVHVisualizer');
	BVH1.setInput(0, sphere1);
	BVHVisualizer1.setInput(0, BVH1);

	let container = await BVHVisualizer1.compute();
	let core_group = container.coreContent()!;
	let geo = (core_group.objects()[0].children[0] as Mesh).geometry;
	assert.equal(geo.attributes.position.array.length, 5856);

	BVHVisualizer1.p.depth.set(5);
	container = await BVHVisualizer1.compute();
	core_group = container.coreContent()!;
	geo = (core_group.objects()[0].children[0] as Mesh).geometry;
	assert.equal(geo.attributes.position.array.length, 384);

	BVHVisualizer1.p.depth.set(6);
	container = await BVHVisualizer1.compute();
	core_group = container.coreContent()!;
	geo = (core_group.objects()[0].children[0] as Mesh).geometry;
	assert.equal(geo.attributes.position.array.length, 768);

	BVHVisualizer1.p.depth.set(2);
	container = await BVHVisualizer1.compute();
	core_group = container.coreContent()!;
	geo = (core_group.objects()[0].children[0] as Mesh).geometry;
	assert.equal(geo.attributes.position.array.length, 48);
});
