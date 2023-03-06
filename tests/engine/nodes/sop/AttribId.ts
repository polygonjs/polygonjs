import {AttribClass} from '../../../../src/core/geometry/Constant';
import {AttributeHelper} from '../../../helpers/AttributeHelper';
import {BufferAttribute} from 'three';
import {coreObjectFactory} from '../../../../src/core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../../src/core/geometry/ObjectContent';

QUnit.test('sop/attribId simple on points', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attribId1 = geo1.createNode('attribId');

	attribId1.setInput(0, plane1);
	attribId1.setAttribClass(AttribClass.VERTEX);

	let container = await attribId1.compute();
	let coreGroup = container.coreContent()!;
	const geo = coreGroup.threejsObjectsWithGeo()[0].geometry;
	assert.ok(geo.getAttribute('id'));
	assert.ok(geo.getAttribute('idn'));
	assert.deepEqual(((geo.getAttribute('id') as BufferAttribute).array as number[]).join(','), [0, 1, 2, 3].join(','));
	assert.deepEqual(
		AttributeHelper.toArray(geo.getAttribute('idn') as BufferAttribute)
			.map((n) => n.toFixed(3))
			.join(','),
		[0, 1 / 3, 2 / 3, 1].map((n) => n.toFixed(3)).join(',')
	);
});

QUnit.test('sop/attribId simple on objects', async (assert) => {
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
		objects.map((o: ObjectContent<CoreObjectType>) => coreObjectFactory(o).attribValue(o, 'id')),
		[0, 1, 2, 3]
	);
	assert.deepEqual(
		objects.map((o: ObjectContent<CoreObjectType>) => coreObjectFactory(o).attribValue(o, 'idn')),
		[0, 1 / 3, 2 / 3, 1]
	);
});
