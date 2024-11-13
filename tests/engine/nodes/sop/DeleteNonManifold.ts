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
}
