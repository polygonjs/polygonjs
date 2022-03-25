import {BufferGeometryWithBVH} from '../../../../src/engine/operations/sop/utils/Bvh/three-mesh-bvh';

QUnit.test('BVH simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const sphere1 = geo1.createNode('sphere');
	const BVH1 = geo1.createNode('BVH');
	BVH1.setInput(0, sphere1);

	let container = await BVH1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry!;
	assert.ok((geometry as BufferGeometryWithBVH).boundsTree);
});

QUnit.test('BVH is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const sphere1 = geo1.createNode('sphere');
	const BVH1 = geo1.createNode('BVH');
	const transform1 = geo1.createNode('transform');
	BVH1.setInput(0, sphere1);
	transform1.setInput(0, BVH1);

	let container = await BVH1.compute();
	let coreGroup = container.coreContent();
	let geometry = coreGroup?.objectsWithGeo()[0].geometry!;
	assert.ok((geometry as BufferGeometryWithBVH).boundsTree);

	container = await transform1.compute();
	coreGroup = container.coreContent();
	geometry = coreGroup?.objectsWithGeo()[0].geometry!;
	assert.ok((geometry as BufferGeometryWithBVH).boundsTree);
});
