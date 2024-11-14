import {Mesh} from 'three';
import type {QUnit} from '../../../helpers/QUnit';
import {ThreejsPrimitiveTriangle} from '../../../../src/core/geometry/modules/three/ThreejsPrimitiveTriangle';
import {AttribClass} from '../../../../src/core/geometry/Constant';
export function testenginenodessopExtrudeOpenEdges(qUnit: QUnit) {
	qUnit.test('sop/extrudeOpenEdges simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const box1 = geo1.createNode('box');
		const delete1 = geo1.createNode('delete');
		const fuse1 = geo1.createNode('fuse');
		const extrudeOpenEdges1 = geo1.createNode('extrudeOpenEdges');

		delete1.setInput(0, box1);
		fuse1.setInput(0, delete1);
		extrudeOpenEdges1.setInput(0, fuse1);

		delete1.setAttribClass(AttribClass.PRIMITIVE);
		delete1.p.byExpression.set(true);
		delete1.p.expression.set('@primnum==0 || @primnum==1');

		async function compute() {
			const container = await extrudeOpenEdges1.compute();
			const coreGroup = container.coreContent()!;
			const mesh = coreGroup.allObjects()[0] as Mesh;
			const primitivesCount = ThreejsPrimitiveTriangle.entitiesCount(mesh);
			const index = mesh.geometry.index!.array;
			const positions = mesh.geometry.getAttribute('position')!.array;
			return {primitivesCount, index, positions};
		}

		extrudeOpenEdges1.p.filterEdges.set(true);
		assert.deepEqual((await compute()).primitivesCount, 12, '12 prims');
		assert.deepEqual((await compute()).index.length, 36, '30 indices');
		assert.deepEqual((await compute()).positions.length, 30, '10 positions');

		extrudeOpenEdges1.p.filterEdges.set(false);
		assert.deepEqual((await compute()).primitivesCount, 18, '18 prims');
		assert.deepEqual((await compute()).index.length, 54, '54 indices');
		assert.deepEqual((await compute()).positions.length, 48, '16 positions');
	});
}
