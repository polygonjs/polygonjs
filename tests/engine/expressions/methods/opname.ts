import {CorePoint} from '../../../../src/core/geometry/Point';

QUnit.test('expression opname works', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('`opname("..")`');
	attrib_create1.p.value1.set(1);
	attrib_create1.setInput(0, line1);

	let container = await attrib_create1.compute();
	assert.deepEqual(
		container
			.coreContent()!
			.points()
			.map((p: CorePoint) => p.attribValue('geo1')),
		[1, 1]
	);
});
