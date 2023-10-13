import {AttribClass} from '../../../../src/core/geometry/Constant';
import {corePrimitiveClassFactory} from '../../../../src/core/geometry/CoreObjectFactory';
import type {QUnit} from '../../../helpers/QUnit';
import {Vector3, Box3} from 'three';
export function testenginenodessopFacet(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	qUnit.test('sop/facet simple', async (assert) => {
		const geo1 = window.geo1;

		const sphere1 = geo1.createNode('sphere');
		sphere1.p.resolution.set([8, 6]);
		const facet1 = geo1.createNode('facet');
		facet1.setInput(0, sphere1);

		async function compute() {
			const container = await facet1.compute();
			const coreGroup = container.coreContent()!;
			coreGroup.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);

			return {bbox: tmpBox, size: tmpSize, pointsCount: coreGroup.pointsCount()};
		}

		// let container = await face1.compute();
		assert.equal((await compute()).pointsCount, 240);

		facet1.p.angle.set(10);
		// container = await face1.compute();
		assert.equal((await compute()).pointsCount, 240);
		assert.deepEqual((await compute()).size.toArray(), [2, 2, 2]);
	});

	qUnit.test('sop/facet preserves primitive attributes', async (assert) => {
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribCreate2 = geo1.createNode('attribCreate');
		const facet1 = geo1.createNode('facet');
		attribCreate1.setInput(0, box1);
		attribCreate2.setInput(0, attribCreate1);
		facet1.setInput(0, attribCreate2);

		attribCreate1.setAttribClass(AttribClass.PRIMITIVE);
		attribCreate2.setAttribClass(AttribClass.PRIMITIVE);

		attribCreate1.p.name.set('a');
		attribCreate2.p.name.set('b');

		async function compute() {
			const container = await facet1.compute();
			const coreGroup = container.coreContent()!;
			const object = coreGroup.allObjects()[0];

			const primitiveAttibutes = corePrimitiveClassFactory(object).attributes(object)!;
			assert.ok(primitiveAttibutes, 'primitiveAttibutes');
			const primitiveAttibuteNames = Object.keys(primitiveAttibutes);

			return {bbox: tmpBox, size: tmpSize, pointsCount: coreGroup.pointsCount(), primitiveAttibuteNames};
		}

		assert.deepEqual((await compute()).primitiveAttibuteNames, ['a', 'b']);
		facet1.p.angle.set(10);
		assert.deepEqual((await compute()).primitiveAttibuteNames, ['a', 'b']);
	});
}
