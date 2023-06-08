import {TransformTargetType} from '../../../../src/core/Transform';
import { ObjectTransformMode } from '../../../../src/core/TransformSpace';

QUnit.test('transform copy simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const transform_copy1 = geo1.createNode('transformCopy');

	transform1.setInput(0, box1);
	transform_copy1.setInput(0, box1);
	transform_copy1.setInput(1, transform1);

	transform1.setApplyOn(TransformTargetType.OBJECT);
	transform1.setObjectMode(ObjectTransformMode.MULT);
	transform1.p.t.x.set(2);
	transform1.p.r.y.set(Math.PI);

	let container = await transform_copy1.compute();
	let core_group = container.coreContent()!;
	let elements = core_group.threejsObjects()[0].matrix.elements;
	assert.in_delta(elements[0], 1, 0.01);
	assert.equal(elements[12], 2);
});
