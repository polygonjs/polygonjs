import type {QUnit} from '../../../helpers/QUnit';
import {primitivesFromObject} from '../../../../src/core/geometry/entities/primitive/CorePrimitiveUtils';
import {CorePrimitive} from '../../../../src/core/geometry/entities/primitive/CorePrimitive';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
import {pointsFromObject} from '../../../../src/core/geometry/entities/point/CorePointUtils';
import {CorePoint} from '../../../../src/core/geometry/entities/point/CorePoint';
import {corePointClassFactory} from '../../../../src/core/geometry/CoreObjectFactory';
import {QuadTriangulationAttribute} from '../../../../src/core/geometry/modules/quad/QuadCommon';
export function testenginenodessopQuadTriangulate(qUnit: QUnit) {
	qUnit.test('sop/quadTriangulate prim count', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');
		const quadTriangulate1 = geo1.createNode('quadTriangulate');
		quadTriangulate1.setInput(0, quadPlane1);
		quadTriangulate1.p.triangles.set(true);
		quadTriangulate1.p.wireframe.set(false);

		async function compute() {
			const container = await quadTriangulate1.compute();
			const object = container.coreContent()!.allObjects()[0];
			const primitives: CorePrimitive<CoreObjectType>[] = [];
			primitivesFromObject(object, primitives);
			const primitivesCount = primitives.length;
			return {primitivesCount};
		}

		quadPlane1.p.useSegmentsCount.set(true);
		quadPlane1.p.segments.set([20, 10]);
		assert.equal((await compute()).primitivesCount, 400, 'prims count');

		quadPlane1.p.useSegmentsCount.set(false);
		assert.equal((await compute()).primitivesCount, 2, 'prims count');

		quadPlane1.p.stepSize.set(0.2);
		assert.equal((await compute()).primitivesCount, 50, 'prims count');
	});

	qUnit.test('sop/quadTriangulate center with attributes', async (assert) => {
		const geo1 = window.geo1;

		const hexagons1 = geo1.createNode('hexagons');
		const quadrangulate1 = geo1.createNode('quadrangulate');
		const quadSmooth1 = geo1.createNode('quadSmooth');
		const quadTriangulate1 = geo1.createNode('quadTriangulate');

		hexagons1.p.hexagonRadius.set(0.22);
		quadrangulate1.p.regular.set(false);

		quadrangulate1.setInput(0, hexagons1);
		quadSmooth1.setInput(0, quadrangulate1);
		quadTriangulate1.setInput(0, quadSmooth1);

		quadTriangulate1.p.triangles.set(false);
		quadTriangulate1.p.wireframe.set(false);
		quadTriangulate1.p.center.set(true);
		quadTriangulate1.p.innerRadius.set(false);
		quadTriangulate1.p.outerRadius.set(false);

		async function compute() {
			const container = await quadTriangulate1.compute();
			const object = container.coreContent()!.allObjects()[0];
			//
			const points: CorePoint<CoreObjectType>[] = [];
			pointsFromObject(object, points);
			const pointsCount = points.length;
			//
			const hasInnerRadius = corePointClassFactory(object).hasAttribute(
				object,
				QuadTriangulationAttribute.INNER_RADIUS
			);
			const hasOuterRadius = corePointClassFactory(object).hasAttribute(
				object,
				QuadTriangulationAttribute.OUTER_RADIUS
			);

			const innerRadius = hasInnerRadius
				? (points[0].attribValue(QuadTriangulationAttribute.INNER_RADIUS) as number)
				: -1;
			const outerRadius = hasOuterRadius
				? (points[0].attribValue(QuadTriangulationAttribute.OUTER_RADIUS) as number)
				: -1;

			//
			return {pointsCount, hasInnerRadius, hasOuterRadius, innerRadius, outerRadius};
		}

		assert.equal((await compute()).pointsCount, 34, 'points count');
		assert.equal((await compute()).hasInnerRadius, false, 'no attrib');
		assert.equal((await compute()).hasOuterRadius, false, 'no attrib');

		quadTriangulate1.p.innerRadius.set(true);
		quadTriangulate1.p.outerRadius.set(true);
		assert.equal((await compute()).hasInnerRadius, true, 'attrib');
		assert.equal((await compute()).hasOuterRadius, true, 'attrib');
		assert.in_delta((await compute()).innerRadius, 0.0497, 0.01, 'inner');
		assert.in_delta((await compute()).outerRadius, 0.084, 0.01, 'outer');
	});
}
