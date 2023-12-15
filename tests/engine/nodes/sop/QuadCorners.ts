import {ThreejsCoreObject} from '../../../../src/engine/index_all';
import type {QUnit} from '../../../helpers/QUnit';

export function testenginenodessopQuadCorners(qUnit: QUnit) {
	qUnit.test('sop/quadCorners simple', async (assert) => {
		const geo1 = window.geo1;

		const hexagons1 = geo1.createNode('hexagons');
		const quadrangulate1 = geo1.createNode('quadrangulate');
		const quadCorners1 = geo1.createNode('quadCorners');
		quadrangulate1.setInput(0, hexagons1);
		quadCorners1.setInput(0, quadrangulate1);

		hexagons1.p.size.set([4, 3]);
		hexagons1.p.hexagonRadius.set(0.5005);

		async function compute() {
			const container = await quadCorners1.compute();
			const objects = container.coreContent()!.allObjects() || [];
			return {objects};
		}

		assert.equal((await compute()).objects.length, 46, 'objects count');
		assert.equal(ThreejsCoreObject.attribValue((await compute()).objects[0], 'cornersCount'), 3, 'corners count');
	});
}
