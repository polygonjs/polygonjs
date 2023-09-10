import type {QUnit} from '../../../helpers/QUnit';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {primitivesFromObject} from '../../../../src/core/geometry/entities/primitive/CorePrimitiveUtils';
import {verticesFromObject} from '../../../../src/core/geometry/entities/vertex/CoreVertexUtils';
export function testenginenodessopQuadPlane(qUnit: QUnit) {
	qUnit.test('sop/quadPlane prim count', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');

		async function primsCount() {
			const container = await quadPlane1.compute();
			const object = container.coreContent()!.allObjects()[0];
			const primitives = primitivesFromObject(object);
			return primitives.length;
		}

		quadPlane1.p.useSegmentsCount.set(true);
		quadPlane1.p.segments.set([20, 10]);
		assert.equal(await primsCount(), 200, 'prims count');

		quadPlane1.p.useSegmentsCount.set(false);
		assert.equal(await primsCount(), 1, 'prims count');

		quadPlane1.p.stepSize.set(0.2);
		assert.equal(await primsCount(), 25, 'prims count');
	});

	qUnit.test('sop/quadPlane prim attrib', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');

		const attribCreate1 = geo1.createNode('attribCreate');

		quadPlane1.p.useSegmentsCount.set(true);
		quadPlane1.p.segments.set([2, 1]);
		attribCreate1.setInput(0, quadPlane1);
		attribCreate1.setAttribClass(AttribClass.PRIMITIVE);
		attribCreate1.p.name.set('t');
		attribCreate1.p.size.set(1);
		attribCreate1.p.value1.set('(@primnum+1)*2');

		const container = await attribCreate1.compute();
		const object = container.coreContent()!.allObjects()[0];
		const primitives = primitivesFromObject(object);
		assert.deepEqual(
			primitives.map((p) => p.attribValue('t')),
			[2, 4]
		);
	});

	qUnit.test('sop/quadPlane vertex attrib', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');

		const attribCreate1 = geo1.createNode('attribCreate');

		quadPlane1.p.useSegmentsCount.set(true);
		quadPlane1.p.segments.set([2, 1]);
		attribCreate1.setInput(0, quadPlane1);
		attribCreate1.setAttribClass(AttribClass.VERTEX);
		attribCreate1.p.name.set('t');
		attribCreate1.p.size.set(1);
		attribCreate1.p.value1.set('(@vtxnum+1)*2');

		const container = await attribCreate1.compute();
		const object = container.coreContent()!.allObjects()[0];
		const vertices = verticesFromObject(object);
		assert.deepEqual(
			vertices.map((p) => p.attribValue('t')),
			[2, 4, 6, 8, 10, 12, 14, 16]
		);
	});
}
