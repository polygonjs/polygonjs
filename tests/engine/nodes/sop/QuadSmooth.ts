import type {QUnit} from '../../../helpers/QUnit';
import {primitivesFromObject} from '../../../../src/core/geometry/primitive/CorePrimitiveUtils';
import {QuadSmoothMode} from '../../../../src/engine/nodes/sop/QuadSmooth';
export function testenginenodessopQuadSmooth(qUnit: QUnit) {
	qUnit.test('sop/quadsmooth prim count', async (assert) => {
		const geo1 = window.geo1;

		const hexagons1 = geo1.createNode('hexagons');
		const quadrangulate1 = geo1.createNode('quadrangulate');
		const quadSmooth1 = geo1.createNode('quadSmooth');
		quadrangulate1.setInput(0, hexagons1);
		quadSmooth1.setInput(0, quadrangulate1);

		async function primsCount() {
			const container = await quadSmooth1.compute();
			const object = container.coreContent()!.allObjects()[0];
			const primitives = primitivesFromObject(object);
			return primitives.length;
		}

		hexagons1.p.size.set([4, 3]);
		hexagons1.p.hexagonRadius.set(0.5005);
		quadrangulate1.p.regular.set(false);

		quadSmooth1.setMode(QuadSmoothMode.AVERAGE);
		quadSmooth1.p.iterations.set(60);
		assert.equal(await primsCount(), 106, 'prims count');

		quadSmooth1.setMode(QuadSmoothMode.SQUARIFY);
		quadSmooth1.p.iterations.set(60);
		assert.equal(await primsCount(), 106, 'prims count');
	});
}
