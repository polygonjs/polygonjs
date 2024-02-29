import type {QUnit} from '../../../helpers/QUnit';
import {primitivesFromObject} from '../../../../src/core/geometry/entities/primitive/CorePrimitiveUtils';
import {CorePrimitive} from '../../../../src/core/geometry/entities/primitive/CorePrimitive';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
export function testenginenodessopQuadConnection(qUnit: QUnit) {
	qUnit.test('sop/quadConnection prim count', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');
		quadPlane1.p.useSegmentsCount.set(true);
		quadPlane1.p.segments.set([20, 10]);

		const quadConnection1 = geo1.createNode('quadConnection');
		quadConnection1.setInput(0, quadPlane1);

		async function compute() {
			const container = await quadConnection1.compute();
			const object = container.coreContent()!.allObjects()[0];
			const primitives: CorePrimitive<CoreObjectType>[] = [];
			primitivesFromObject(object, primitives);
			const primitivesCount = primitives.length;
			return {primitivesCount};
		}

		assert.equal((await compute()).primitivesCount, 2, 'prims count');
	});
}
