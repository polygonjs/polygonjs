import {AttributeHelper} from '../../../helpers/AttributeHelper';

QUnit.test('attribId simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attribId1 = geo1.createNode('attribId');

	attribId1.setInput(0, plane1);

	let container = await attribId1.compute();
	let coreGroup = container.coreContent()!;
	const geo = coreGroup.objectsWithGeo()[0].geometry;
	assert.ok(geo.getAttribute('id'));
	assert.ok(geo.getAttribute('idn'));
	assert.deepEqual((geo.getAttribute('id').array as number[]).join(','), [0, 1, 2, 3].join(','));
	assert.deepEqual(
		AttributeHelper.toArray(geo.getAttribute('idn'))
			.map((n) => n.toFixed(3))
			.join(','),
		[0, 1 / 3, 2 / 3, 1].map((n) => n.toFixed(3)).join(',')
	);
});
