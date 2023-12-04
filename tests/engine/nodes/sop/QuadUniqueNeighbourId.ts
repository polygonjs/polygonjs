import type {QUnit} from '../../../helpers/QUnit';
import {primitivesFromObject} from '../../../../src/core/geometry/entities/primitive/CorePrimitiveUtils';
import {QuadSmoothMode} from '../../../../src/engine/nodes/sop/QuadSmooth';
import {CorePrimitive} from '../../../../src/core/geometry/entities/primitive/CorePrimitive';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
import {setToArray} from '../../../../src/core/SetUtils';
export function testenginenodessopQuadUniqueneighbourId(qUnit: QUnit) {
	qUnit.test('sop/quadUniqueneighbourId simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const quadrangulate1 = geo1.createNode('quadrangulate');
		const quadSmooth1 = geo1.createNode('quadSmooth');
		const quadUniqueNeighbourId1 = geo1.createNode('quadUniqueNeighbourId');
		quadrangulate1.setInput(0, plane1);
		quadSmooth1.setInput(0, quadrangulate1);
		quadUniqueNeighbourId1.setInput(0, quadSmooth1);

		async function compute() {
			const container = await quadUniqueNeighbourId1.compute();
			const object = container.coreContent()!.allObjects()[0];
			const primitives: CorePrimitive<CoreObjectType>[] = [];
			primitivesFromObject(object, primitives);
			const valuesSet: Set<number> = new Set();
			const values: number[] = [];
			for (const primitive of primitives) {
				const value = primitive.attribValue('colorId') as number | undefined;
				if (value != null) {
					valuesSet.add(value);
				}
			}
			setToArray(valuesSet, values);
			values.sort();
			return {values};
		}

		quadrangulate1.p.regular.set(false);
		quadSmooth1.setMode(QuadSmoothMode.AVERAGE);
		quadSmooth1.p.iterations.set(60);

		plane1.p.size.set([1, 1]);
		assert.deepEqual((await compute()).values, [0, 1], 'colorIds');

		plane1.p.size.set([2, 2]);
		assert.deepEqual((await compute()).values, [0, 1, 2], 'colorIds');

		plane1.p.size.set([3, 3]);
		assert.deepEqual((await compute()).values, [0, 1, 2, 3], 'colorIds');

		plane1.p.size.set([4, 4]);
		assert.deepEqual((await compute()).values, [0, 1, 2, 3], 'colorIds');

		plane1.p.size.set([5, 5]);
		assert.deepEqual((await compute()).values, [0, 1, 2, 3], 'colorIds');

		plane1.p.size.set([20, 20]);
		assert.deepEqual((await compute()).values, [0, 1, 2, 3, 4], 'colorIds');

		plane1.p.size.set([50, 50]);
		assert.deepEqual((await compute()).values, [0, 1, 2, 3, 4], 'colorIds');
	});
}
