import {CorePoint} from '../../../../src/core/geometry/Point';

QUnit.test('expression opdigits works', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('ptid');
	attrib_create1.p.value1.set('opdigits(".")');
	attrib_create1.setInput(0, line1);

	let container = await attrib_create1.request_container();
	assert.deepEqual(
		container
			.core_content()!
			.points()
			.map((p: CorePoint) => p.attrib_value('ptid')),
		[1, 1]
	);

	attrib_create1.setName('bla12');
	container = await attrib_create1.request_container();
	assert.deepEqual(
		container
			.core_content()!
			.points()
			.map((p: CorePoint) => p.attrib_value('ptid')),
		[12, 12]
	);
});
