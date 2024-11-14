import {Mesh} from 'three';
import type {QUnit} from '../../../helpers/QUnit';
import {ThreejsPrimitiveTriangle} from '../../../../src/core/geometry/modules/three/ThreejsPrimitiveTriangle';
export function testenginenodessopDeleteNonManifold(qUnit: QUnit) {
	qUnit.test('sop/deleteNonManifold simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const box1 = geo1.createNode('box');
		const box2 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');
		const merge1 = geo1.createNode('merge');
		const fuse1 = geo1.createNode('fuse');
		const deleteNonManifold1 = geo1.createNode('deleteNonManifold');

		merge1.setInput(0, box1);
		transform1.setInput(0, box2);
		merge1.setInput(1, transform1);
		fuse1.setInput(0, merge1);
		deleteNonManifold1.setInput(0, fuse1);

		transform1.p.t.x.set(1);
		merge1.setCompactMode(true);

		async function compute() {
			const container = await deleteNonManifold1.compute();
			const coreGroup = container.coreContent()!;
			const mesh = coreGroup.allObjects()[0] as Mesh;
			const primitivesCount = ThreejsPrimitiveTriangle.entitiesCount(mesh);
			return {primitivesCount};
		}

		assert.deepEqual((await compute()).primitivesCount, 20, '20 prims');
		deleteNonManifold1.p.invert.set(1);
		assert.deepEqual((await compute()).primitivesCount, 4, '4 prims');
	});

	qUnit.test('sop/deleteNonManifold with 5 boxes', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const box1 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');
		const transform2 = geo1.createNode('transform');
		const transform3 = geo1.createNode('transform');
		const transform4 = geo1.createNode('transform');
		const transform5 = geo1.createNode('transform');
		const merge1 = geo1.createNode('merge');
		const fuse1 = geo1.createNode('fuse');
		const deleteNonManifold1 = geo1.createNode('deleteNonManifold');

		transform1.setInput(0, box1);
		transform2.setInput(0, box1);
		transform3.setInput(0, box1);
		transform4.setInput(0, box1);
		transform5.setInput(0, box1);
		merge1.io.inputs.setCount(5);
		merge1.setInput(0, transform1);
		merge1.setInput(1, transform2);
		merge1.setInput(2, transform3);
		merge1.setInput(3, transform4);
		merge1.setInput(4, transform5);
		fuse1.setInput(0, merge1);
		deleteNonManifold1.setInput(0, fuse1);

		transform1.p.t.set([0, 0, 0]);
		transform2.p.t.set([1, 0, 0]);
		transform3.p.t.set([-1, 0, 0]);
		transform4.p.t.set([0, 0, 1]);
		transform5.p.t.set([0, 0, -1]);
		merge1.setCompactMode(true);

		async function compute() {
			const container = await deleteNonManifold1.compute();
			const coreGroup = container.coreContent()!;
			const mesh = coreGroup.allObjects()[0] as Mesh;
			const primitivesCount = ThreejsPrimitiveTriangle.entitiesCount(mesh);
			return {primitivesCount};
		}

		assert.deepEqual((await compute()).primitivesCount, 44, '44 prims');
		deleteNonManifold1.p.invert.set(1);
		assert.deepEqual((await compute()).primitivesCount, 16, '16 prims');
	});

	qUnit.test('sop/deleteNonManifold sphere with fuse', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const sphere1 = geo1.createNode('sphere');
		const fuse1 = geo1.createNode('fuse');
		const deleteNonManifold1 = geo1.createNode('deleteNonManifold');

		fuse1.setInput(0, sphere1);
		deleteNonManifold1.setInput(0, fuse1);

		sphere1.p.resolution.set([5, 5]);
		fuse1.p.dist.set(1.4);

		async function compute() {
			const container = await deleteNonManifold1.compute();
			const coreGroup = container.coreContent()!;
			const mesh = coreGroup.allObjects()[0] as Mesh;
			const primitivesCount = ThreejsPrimitiveTriangle.entitiesCount(mesh);
			return {primitivesCount};
		}

		assert.deepEqual((await compute()).primitivesCount, 8, '8 prims');
		deleteNonManifold1.p.invert.set(1);
		assert.deepEqual((await compute()).primitivesCount, 0, '0 prims');
	});
}
