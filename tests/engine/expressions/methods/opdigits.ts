import {CorePoint} from '../../../../src/core/geometry/Point';

QUnit.test('expression opdigits works', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');
	const attrib_create1 = geo1.createNode('attrib_create');
	attrib_create1.p.name.set('ptid');
	attrib_create1.p.value1.set('opdigits(".")');
	attrib_create1.set_input(0, line1);

	let container = await attrib_create1.request_container();
	assert.deepEqual(
		container
			.core_content()!
			.points()
			.map((p: CorePoint) => p.attrib_value('ptid')),
		[1, 1]
	);

	attrib_create1.set_name('bla12');
	container = await attrib_create1.request_container();
	assert.deepEqual(
		container
			.core_content()!
			.points()
			.map((p: CorePoint) => p.attrib_value('ptid')),
		[12, 12]
	);
});
