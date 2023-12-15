import type {QUnit} from '../../../helpers/QUnit';
import {primitivesFromObject} from '../../../../src/core/geometry/entities/primitive/CorePrimitiveUtils';
import {CorePrimitive} from '../../../../src/core/geometry/entities/primitive/CorePrimitive';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
import {TransformTargetType} from '../../../../src/core/Transform';

export function testenginenodessopQuadrangulate(qUnit: QUnit) {
	qUnit.test('sop/quadrangulate prim count', async (assert) => {
		const geo1 = window.geo1;

		const hexagons1 = geo1.createNode('hexagons');
		const quadrangulate1 = geo1.createNode('quadrangulate');
		quadrangulate1.setInput(0, hexagons1);

		async function primsCount() {
			const container = await quadrangulate1.compute();
			const object = container.coreContent()!.allObjects()[0];
			const primitives: CorePrimitive<CoreObjectType>[] = [];
			primitivesFromObject(object, primitives);
			return primitives.length;
		}

		hexagons1.p.size.set([4, 3]);
		hexagons1.p.hexagonRadius.set(0.5005);

		quadrangulate1.p.regular.set(true);
		assert.equal(await primsCount(), 21, 'prims count');

		quadrangulate1.p.regular.set(false);
		quadrangulate1.p.granular.set(false);
		assert.equal(await primsCount(), 106, 'prims count');

		quadrangulate1.p.subdivide.set(false);
		assert.equal(await primsCount(), 22, 'prims count');

		quadrangulate1.p.granular.set(true);
		quadrangulate1.p.subdivide.set(true);
		assert.equal(await primsCount(), 106, 'prims count');

		quadrangulate1.p.subdivide.set(false);
		assert.equal(await primsCount(), 22, 'prims count');
	});

	qUnit.test('sop/quadrangulate preserves matrix', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const transform1 = geo1.createNode('transform');
		const quadrangulate1 = geo1.createNode('quadrangulate');
		transform1.setInput(0, plane1);
		quadrangulate1.setInput(0, transform1);

		async function compute() {
			const container = await quadrangulate1.compute();
			const object = container.coreContent()!.quadObjects()![0];
			const positions = object.geometry.attributes.position.array;
			return {positions};
		}

		transform1.setApplyOn(TransformTargetType.GEOMETRY);
		transform1.p.t.x.set(0);

		quadrangulate1.p.regular.set(true);
		assert.equal((await compute()).positions[0], -0.5, '0');

		transform1.p.t.x.set(1.5);
		assert.equal((await compute()).positions[0], 1, '1');

		transform1.setApplyOn(TransformTargetType.OBJECT);
		assert.equal((await compute()).positions[0], 1, '1');
	});
}
