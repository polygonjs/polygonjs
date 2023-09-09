import type {QUnit} from '../../../helpers/QUnit';
import {primitivesFromObject} from '../../../../src/core/geometry/primitive/CorePrimitiveUtils';
export function testenginenodessopQuadrangulate(qUnit: QUnit) {
	qUnit.test('sop/quadrangulate prim count', async (assert) => {
		const geo1 = window.geo1;

		const hexagons1 = geo1.createNode('hexagons');
		const quadrangulate1 = geo1.createNode('quadrangulate');
		quadrangulate1.setInput(0, hexagons1);

		async function primsCount() {
			const container = await quadrangulate1.compute();
			const object = container.coreContent()!.allObjects()[0];
			const primitives = primitivesFromObject(object);
			return primitives.length;
		}

		hexagons1.p.size.set([4, 3]);
		hexagons1.p.hexagonRadius.set(0.5005);

		quadrangulate1.p.regular.set(true);
		assert.equal(await primsCount(), 25, 'prims count');

		quadrangulate1.p.regular.set(false);
		assert.equal(await primsCount(), 106, 'prims count');
	});
}
