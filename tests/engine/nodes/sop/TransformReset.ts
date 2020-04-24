import {TRANSFORM_SOP_TARGET_TYPES, TransformSopTargetType} from '../../../../src/engine/nodes/sop/Transform';
import {Matrix4} from 'three';

QUnit.test('transform reset simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);

	const box1 = geo1.create_node('box');
	const transform1 = geo1.create_node('transform');
	const transform_reset1 = geo1.create_node('transform_reset');

	transform1.set_input(0, box1);
	transform_reset1.set_input(0, transform1);

	transform1.p.apply_on.set(TRANSFORM_SOP_TARGET_TYPES.indexOf(TransformSopTargetType.OBJECTS));
	transform1.p.t.x.set(2);
	transform1.p.r.y.set(Math.PI);

	let container = await transform1.request_container();
	let core_group = container.core_content()!;
	let elements = core_group.objects()[0].matrix.elements;
	assert.in_delta(elements[0], 1, 0.01);
	assert.equal(elements[12], 2);

	container = await transform_reset1.request_container();
	core_group = container.core_content()!;
	elements = core_group.objects()[0].matrix.elements;
	assert.deepEqual(elements, new Matrix4().identity().elements);
});
