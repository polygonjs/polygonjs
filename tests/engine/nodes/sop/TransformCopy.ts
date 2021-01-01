import {TRANSFORM_TARGET_TYPES, TransformTargetType} from '../../../../src/core/Transform';

QUnit.test('transform copy simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const transform_copy1 = geo1.createNode('transformCopy');

	transform1.setInput(0, box1);
	transform_copy1.setInput(0, box1);
	transform_copy1.setInput(1, transform1);

	transform1.p.apply_on.set(TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.OBJECTS));
	transform1.p.t.x.set(2);
	transform1.p.r.y.set(Math.PI);

	let container = await transform_copy1.requestContainer();
	let core_group = container.coreContent()!;
	let elements = core_group.objects()[0].matrix.elements;
	assert.in_delta(elements[0], 1, 0.01);
	assert.equal(elements[12], 2);
});
