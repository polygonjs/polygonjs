import type {QUnit} from '../../../helpers/QUnit';
import {ObjectTransformSpace} from './../../../../src/core/TransformSpace';
import {TransformTargetType} from './../../../../src/core/Transform';
import {HierarchyMode} from './../../../../src/engine/operations/sop/Hierarchy';
import {BufferAttribute, Box3, Mesh, Vector3} from 'three';
export function testenginenodessopBVHVisualizer(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpCenter = new Vector3();

	qUnit.test('sop/BVHVisualizer simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const sphere1 = geo1.createNode('sphere');
		const BVH1 = geo1.createNode('BVH');
		const BVHVisualizer1 = geo1.createNode('BVHVisualizer');
		BVH1.setInput(0, sphere1);
		BVHVisualizer1.setInput(0, BVH1);

		let container = await BVHVisualizer1.compute();
		let coreGroup = container.coreContent()!;
		assert.equal(coreGroup.threejsObjects().length, 2, '2 objects');
		let geo = (coreGroup.threejsObjects()[0] as Mesh).geometry;
		assert.equal((geo.attributes.position as BufferAttribute).array.length, 2883, '2883');
		geo = (coreGroup.threejsObjects()[1].children[0] as Mesh).geometry;
		assert.equal((geo.attributes.position as BufferAttribute).array.length, 5856, '5856');

		BVHVisualizer1.p.depth.set(5);
		container = await BVHVisualizer1.compute();
		coreGroup = container.coreContent()!;
		geo = (coreGroup.threejsObjects()[1].children[0] as Mesh).geometry;
		assert.equal((geo.attributes.position as BufferAttribute).array.length, 384, '384');

		BVHVisualizer1.p.depth.set(6);
		container = await BVHVisualizer1.compute();
		coreGroup = container.coreContent()!;
		geo = (coreGroup.threejsObjects()[1].children[0] as Mesh).geometry;
		assert.equal((geo.attributes.position as BufferAttribute).array.length, 768, '768');

		BVHVisualizer1.p.depth.set(2);
		container = await BVHVisualizer1.compute();
		coreGroup = container.coreContent()!;
		geo = (coreGroup.threejsObjects()[1].children[0] as Mesh).geometry;
		assert.equal((geo.attributes.position as BufferAttribute).array.length, 48, '48');
	});

	qUnit.test('sop/BVHVisualizer with hierarchy', async (assert) => {
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
		transform1.setApplyOn(TransformTargetType.OBJECT);
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
		async function getBbox() {
			const container = await bvhVisualizer1.compute();
			container.coreContent()!.boundingBox(tmpBox);
			tmpBox.getCenter(tmpCenter);
			return {box: tmpBox, center: tmpCenter};
		}

		copy1.setObjectTransformSpace(ObjectTransformSpace.PARENT);
		assert.in_delta((await getBbox()).center.x, 1, 0.1);

		copy1.setObjectTransformSpace(ObjectTransformSpace.LOCAL);
		assert.in_delta((await getBbox()).center.x, 10, 0.1);
	});
}
