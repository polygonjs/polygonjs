import {ObjectTransformSpace} from './../../../../src/core/TransformSpace';
import {TransformTargetType} from './../../../../src/core/Transform';
import {HierarchyMode} from './../../../../src/engine/operations/sop/Hierarchy';
import {Mesh, Vector3} from 'three';

QUnit.test('sop/BVHVisualizer simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const sphere1 = geo1.createNode('sphere');
	const BVH1 = geo1.createNode('BVH');
	const BVHVisualizer1 = geo1.createNode('BVHVisualizer');
	BVH1.setInput(0, sphere1);
	BVHVisualizer1.setInput(0, BVH1);

	let container = await BVHVisualizer1.compute();
	let coreGroup = container.coreContent()!;
	assert.equal(coreGroup.objects().length, 2, '2 objects');
	console.log(coreGroup.objects());
	let geo = (coreGroup.objects()[0] as Mesh).geometry;
	assert.equal(geo.attributes.position.array.length, 2883, '2883');
	geo = (coreGroup.objects()[1].children[0] as Mesh).geometry;
	assert.equal(geo.attributes.position.array.length, 5856, '5856');

	BVHVisualizer1.p.depth.set(5);
	container = await BVHVisualizer1.compute();
	coreGroup = container.coreContent()!;
	geo = (coreGroup.objects()[1].children[0] as Mesh).geometry;
	assert.equal(geo.attributes.position.array.length, 384, '384');

	BVHVisualizer1.p.depth.set(6);
	container = await BVHVisualizer1.compute();
	coreGroup = container.coreContent()!;
	geo = (coreGroup.objects()[1].children[0] as Mesh).geometry;
	assert.equal(geo.attributes.position.array.length, 768, '768');

	BVHVisualizer1.p.depth.set(2);
	container = await BVHVisualizer1.compute();
	coreGroup = container.coreContent()!;
	geo = (coreGroup.objects()[1].children[0] as Mesh).geometry;
	assert.equal(geo.attributes.position.array.length, 48, '48');
});

QUnit.test('sop/BVHVisualizer with hierarchy', async (assert) => {
	const geo1 = window.geo1;
	// hierarchy
	const box1 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	const hierarchy1 = geo1.createNode('hierarchy');
	merge1.setInput(0, box1);
	merge1.setInput(1, box1);
	merge1.setCompactMode(false);
	hierarchy1.setInput(0, merge1);
	hierarchy1.setMode(HierarchyMode.ADD_PARENT);
	hierarchy1.p.levels.set(2);
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, hierarchy1);
	transform1.setApplyOn(TransformTargetType.OBJECTS);
	transform1.p.scale.set(10);

	// template pts
	const add1 = geo1.createNode('add');
	const transform2 = geo1.createNode('transform');
	transform2.setInput(0, add1);
	transform2.p.t.set([1, 0, 0]);

	// copy
	const copy1 = geo1.createNode('copy');
	copy1.setInput(0, transform1);
	copy1.setInput(1, transform2);

	// bvh
	const bvh1 = geo1.createNode('BVH');
	const bvhVisualizer1 = geo1.createNode('BVHVisualizer');
	bvh1.setInput(0, copy1);
	bvhVisualizer1.setInput(0, bvh1);

	copy1.setObjectTransformSpace(ObjectTransformSpace.PARENT);
	let container = await bvhVisualizer1.compute();
	let center = container.coreContent()!.boundingBox().getCenter(new Vector3())!;
	assert.in_delta(center.x, 1, 0.1);

	copy1.setObjectTransformSpace(ObjectTransformSpace.LOCAL);
	container = await bvhVisualizer1.compute();
	center = container.coreContent()!.boundingBox().getCenter(new Vector3())!;
	assert.in_delta(center.x, 10, 0.1);
});
