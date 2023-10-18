import type {QUnit} from '../../../helpers/QUnit';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {primitivesFromObject} from '../../../../src/core/geometry/entities/primitive/CorePrimitiveUtils';
import {QuadCoreObject} from '../../../../src/core/geometry/modules/quad/QuadCoreObject';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
import {CorePrimitive} from '../../../../src/core/geometry/entities/primitive/CorePrimitive';
import {CorePoint} from '../../../../src/core/geometry/entities/point/CorePoint';
import {pointsFromObject} from '../../../../src/core/geometry/entities/point/CorePointUtils';
import {QuadExtrudeSopNode} from '../../../../src/engine/nodes/sop/QuadExtrude';
import {AttribCreateSopNode} from '../../../../src/engine/nodes/sop/AttribCreate';
export function testenginenodessopQuadExtrude(qUnit: QUnit) {
	qUnit.test('sop/quadExtrude simple', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribCreate2 = geo1.createNode('attribCreate');
		const quadExtrude1 = geo1.createNode('quadExtrude');

		attribCreate1.setInput(0, quadPlane1);
		attribCreate2.setInput(0, attribCreate1);
		quadExtrude1.setInput(0, attribCreate2);

		attribCreate1.setAttribClass(AttribClass.POINT);
		attribCreate1.p.name.set('ptAttrib');
		attribCreate1.p.size.set(1);
		attribCreate1.p.value1.set('(@ptnum+1)*2');

		attribCreate2.setAttribClass(AttribClass.PRIMITIVE);
		attribCreate2.p.name.set('primAttrib');
		attribCreate2.p.size.set(1);
		attribCreate2.p.value1.set('(@primnum+1)*2');

		quadExtrude1.p.inset.set(0.1);
		quadExtrude1.p.amount.set(1);

		async function _compute(node: AttribCreateSopNode | QuadExtrudeSopNode) {
			const container = await node.compute();
			const object = container.coreContent()!.allObjects()[0];
			const quadObject = container.coreContent()!.quadObjects()![0];
			const primitives: CorePrimitive<CoreObjectType>[] = [];
			const points: CorePoint<CoreObjectType>[] = [];
			primitivesFromObject(object, primitives);
			pointsFromObject(object, points);
			const objectsData = QuadCoreObject.objectData(quadObject);
			return {primitives, points, objectsData};
		}

		async function computeAttribCreate() {
			return _compute(attribCreate2);
		}

		async function computeExtrude() {
			return _compute(quadExtrude1);
		}

		quadPlane1.p.useSegmentsCount.set(true);
		quadPlane1.p.segments.set([2, 2]);
		assert.equal((await computeExtrude()).primitives.length, 24, 'prims count');
		assert.equal((await computeExtrude()).points.length, 25, 'points count');

		assert.deepEqual(
			(await computeAttribCreate()).primitives.map((p) => p.attribValue('primAttrib')),
			[2, 4, 6, 8],
			'prim attrib'
		);
		assert.deepEqual(
			(await computeAttribCreate()).points.map((p) => p.attribValue('ptAttrib')),
			[2, 4, 6, 8, 10, 12, 14, 16, 18],
			'point attrib'
		);

		assert.deepEqual(
			(await computeExtrude()).primitives.map((p) => p.attribValue('primAttrib')),
			[2, 4, 6, 8, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 6, 8, 8, 8, 8, 8],
			'prim attrib'
		);
		assert.deepEqual(
			(await computeExtrude()).points.map((p) => p.attribValue('ptAttrib')),
			[2, 4, 6, 8, 10, 12, 14, 16, 18, 2, 4, 10, 8, 8, 10, 16, 14, 4, 6, 12, 10, 10, 12, 18, 16],
			'point attrib'
		);

		quadExtrude1.p.sides.set(0);
		assert.equal((await computeExtrude()).primitives.length, 8, 'prims count');
		assert.equal((await computeExtrude()).points.length, 25, 'points count');

		assert.deepEqual(
			(await computeExtrude()).primitives.map((p) => p.attribValue('primAttrib')),
			[2, 4, 6, 8, 2, 4, 6, 8],
			'prim attrib'
		);
		assert.deepEqual(
			(await computeExtrude()).points.map((p) => p.attribValue('ptAttrib')),
			[2, 4, 6, 8, 10, 12, 14, 16, 18, 2, 4, 10, 8, 8, 10, 16, 14, 4, 6, 12, 10, 10, 12, 18, 16],
			'point attrib'
		);
	});
}
