import type {QUnit} from '../../../helpers/QUnit';
import {primitivesFromObject} from '../../../../src/core/geometry/entities/primitive/CorePrimitiveUtils';
import {CorePrimitive} from '../../../../src/core/geometry/entities/primitive/CorePrimitive';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
export function testenginenodessopQuadTriangulate(qUnit: QUnit) {
	qUnit.test('sop/quadTriangulate prim count', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');
		const quadTriangulate1 = geo1.createNode('quadTriangulate');
		quadTriangulate1.setInput(0, quadPlane1);
		quadTriangulate1.p.triangles.set(true);
		quadTriangulate1.p.wireframe.set(false);

		async function primsCount() {
			const container = await quadTriangulate1.compute();
			const object = container.coreContent()!.allObjects()[0];
			const primitives: CorePrimitive<CoreObjectType>[] = [];
			primitivesFromObject(object, primitives);
			return primitives.length;
		}

		quadPlane1.p.useSegmentsCount.set(true);
		quadPlane1.p.segments.set([20, 10]);
		assert.equal(await primsCount(), 400, 'prims count');

		quadPlane1.p.useSegmentsCount.set(false);
		assert.equal(await primsCount(), 2, 'prims count');

		quadPlane1.p.stepSize.set(0.2);
		assert.equal(await primsCount(), 50, 'prims count');
	});
}
