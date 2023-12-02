import type {QUnit} from '../../../helpers/QUnit';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {AttributeHelper} from '../../../helpers/AttributeHelper';
import {BufferAttribute} from 'three';
import {coreObjectClassFactory} from '../../../../src/core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../../src/core/geometry/ObjectContent';
import {CorePrimitive} from '../../../../src/core/geometry/entities/primitive/CorePrimitive';
import {primitivesFromObject} from '../../../../src/core/geometry/entities/primitive/CorePrimitiveUtils';
import {CoreVertex} from '../../../../src/core/geometry/entities/vertex/CoreVertex';
import {verticesFromObject} from '../../../../src/core/geometry/entities/vertex/CoreVertexUtils';
export function testenginenodessopAttribId(qUnit: QUnit) {
	qUnit.test('sop/attribId simple on points', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attribId1 = geo1.createNode('attribId');

		attribId1.setInput(0, plane1);
		attribId1.setAttribClass(AttribClass.POINT);

		let container = await attribId1.compute();
		let coreGroup = container.coreContent()!;
		const geo = coreGroup.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geo.getAttribute('id'));
		assert.ok(geo.getAttribute('idn'));
		assert.deepEqual(
			((geo.getAttribute('id') as BufferAttribute).array ).join(','),
			[0, 1, 2, 3].join(',')
		);
		assert.deepEqual(
			AttributeHelper.toArray(geo.getAttribute('idn') as BufferAttribute)
				.map((n) => n.toFixed(3))
				.join(','),
			[0, 1 / 3, 2 / 3, 1].map((n) => n.toFixed(3)).join(',')
		);
	});

	qUnit.test('sop/attribId simple on 1 point', async (assert) => {
		const geo1 = window.geo1;

		const add1 = geo1.createNode('add');
		const attribId1 = geo1.createNode('attribId');

		attribId1.setInput(0, add1);
		attribId1.setAttribClass(AttribClass.POINT);

		let container = await attribId1.compute();
		let coreGroup = container.coreContent()!;
		const geo = coreGroup.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geo.getAttribute('id'));
		assert.ok(geo.getAttribute('idn'));
		assert.deepEqual(((geo.getAttribute('id') as BufferAttribute).array ).join(','), [0].join(','));
		assert.deepEqual(
			AttributeHelper.toArray(geo.getAttribute('idn') as BufferAttribute)
				.map((n) => n.toFixed(3))
				.join(','),
			[0].map((n) => n.toFixed(3)).join(',')
		);
	});

	qUnit.test('sop/attribId simple on vertices', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attribId1 = geo1.createNode('attribId');

		attribId1.setInput(0, plane1);
		attribId1.setAttribClass(AttribClass.VERTEX);

		let container = await attribId1.compute();
		let coreGroup = container.coreContent()!;
		const object = coreGroup.threejsObjectsWithGeo()[0];
		const vertices: CoreVertex<CoreObjectType>[] = [];
		verticesFromObject(object, vertices);
		// assert.ok(primitives.has('id'));
		// assert.ok(geo.getAttribute('idn'));
		assert.deepEqual(vertices.map((p) => p.attribValue('id')).join(','), [0, 1, 2, 3, 4, 5].join(','));
		assert.deepEqual(
			vertices.map((p) => (p.attribValue('idn') as number).toFixed(3)).join(','),
			[0, 1 / 5, 2 / 5, 3 / 5, 4 / 5, 1].map((n) => n.toFixed(3)).join(',')
		);
	});

	qUnit.test('sop/attribId simple on 1 vertex', async (assert) => {
		const geo1 = window.geo1;

		const add1 = geo1.createNode('add');
		const attribId1 = geo1.createNode('attribId');

		attribId1.setInput(0, add1);
		attribId1.setAttribClass(AttribClass.VERTEX);

		let container = await attribId1.compute();
		let coreGroup = container.coreContent()!;
		const object = coreGroup.threejsObjectsWithGeo()[0];
		const vertices: CoreVertex<CoreObjectType>[] = [];
		verticesFromObject(object, vertices);
		// assert.ok(primitives.has('id'));
		// assert.ok(geo.getAttribute('idn'));
		assert.deepEqual(vertices.map((p) => p.attribValue('id')).join(','), [0].join(','));
		assert.deepEqual(
			vertices.map((p) => (p.attribValue('idn') as number).toFixed(3)).join(','),
			[0].map((n) => n.toFixed(3)).join(',')
		);
	});

	qUnit.test('sop/attribId simple on primitives', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		plane1.p.useSegmentsCount.set(true);
		plane1.p.segments.set([2, 1]);
		const attribId1 = geo1.createNode('attribId');

		attribId1.setInput(0, plane1);
		attribId1.setAttribClass(AttribClass.PRIMITIVE);

		let container = await attribId1.compute();
		let coreGroup = container.coreContent()!;
		const object = coreGroup.threejsObjectsWithGeo()[0];
		const primitives: CorePrimitive<CoreObjectType>[] = [];
		primitivesFromObject(object, primitives);
		// assert.ok(primitives.has('id'));
		// assert.ok(geo.getAttribute('idn'));
		assert.deepEqual(primitives.map((p) => p.attribValue('id')).join(','), [0, 1, 2, 3].join(','));
		assert.deepEqual(
			primitives.map((p) => (p.attribValue('idn') as number).toFixed(3)).join(','),
			[0, 1 / 3, 2 / 3, 1].map((n) => n.toFixed(3)).join(',')
		);
	});

	qUnit.test('sop/attribId simple on 1 primitive', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');
		const attribId1 = geo1.createNode('attribId');

		attribId1.setInput(0, quadPlane1);
		attribId1.setAttribClass(AttribClass.PRIMITIVE);

		let container = await attribId1.compute();
		let coreGroup = container.coreContent()!;
		const object = coreGroup.allObjects()[0];
		const primitives: CorePrimitive<CoreObjectType>[] = [];
		primitivesFromObject(object, primitives);
		// assert.ok(primitives.has('id'));
		// assert.ok(geo.getAttribute('idn'));
		assert.deepEqual(primitives.map((p) => p.attribValue('id')).join(','), [0].join(','));
		assert.deepEqual(
			primitives.map((p) => (p.attribValue('idn') as number).toFixed(3)).join(','),
			[0].map((n) => n.toFixed(3)).join(',')
		);
	});

	qUnit.test('sop/attribId simple on objects', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const copy1 = geo1.createNode('copy');
		const attribId1 = geo1.createNode('attribId');

		copy1.setInput(0, box1);
		attribId1.setInput(0, copy1);
		copy1.p.count.set(4);
		attribId1.setAttribClass(AttribClass.OBJECT);

		let container = await attribId1.compute();
		let coreGroup = container.coreContent()!;
		const objects = coreGroup.allObjects();
		assert.equal(objects.length, 4);
		assert.deepEqual(
			objects.map((o: ObjectContent<CoreObjectType>) => coreObjectClassFactory(o).attribValue(o, 'id')),
			[0, 1, 2, 3]
		);
		assert.deepEqual(
			objects.map((o: ObjectContent<CoreObjectType>) => coreObjectClassFactory(o).attribValue(o, 'idn')),
			[0, 1 / 3, 2 / 3, 1]
		);
	});

	qUnit.test('sop/attribId idn with 1 object', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const copy1 = geo1.createNode('copy');
		const attribId1 = geo1.createNode('attribId');

		copy1.setInput(0, box1);
		attribId1.setInput(0, copy1);
		copy1.p.count.set(1);
		attribId1.setAttribClass(AttribClass.OBJECT);

		let container = await attribId1.compute();
		let coreGroup = container.coreContent()!;
		const objects = coreGroup.allObjects();
		assert.equal(objects.length, 1);
		assert.deepEqual(
			objects.map((o: ObjectContent<CoreObjectType>) => coreObjectClassFactory(o).attribValue(o, 'id')),
			[0]
		);
		assert.deepEqual(
			objects.map((o: ObjectContent<CoreObjectType>) => coreObjectClassFactory(o).attribValue(o, 'idn')),
			[0]
		);
	});
}
