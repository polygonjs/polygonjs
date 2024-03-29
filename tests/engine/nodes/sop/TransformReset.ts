import type {QUnit} from '../../../helpers/QUnit';
import {TransformTargetType} from '../../../../src/core/Transform';
import {Matrix4} from 'three';
import {ObjectTransformMode} from '../../../../src/core/TransformSpace';
export function testenginenodessopTransformReset(qUnit: QUnit) {

qUnit.test('transform reset simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const transform_reset1 = geo1.createNode('transformReset');

	transform1.setInput(0, box1);
	transform_reset1.setInput(0, transform1);

	transform1.setApplyOn(TransformTargetType.OBJECT);
	transform1.setObjectMode(ObjectTransformMode.MULT);
	transform1.p.t.x.set(2);
	transform1.p.r.y.set(Math.PI);

	let container = await transform1.compute();
	let core_group = container.coreContent()!;
	let elements = core_group.threejsObjects()[0].matrix.elements;
	assert.in_delta(elements[0], 1, 0.01);
	assert.equal(elements[12], 2);

	container = await transform_reset1.compute();
	core_group = container.coreContent()!;
	elements = core_group.threejsObjects()[0].matrix.elements;
	assert.deepEqual(elements, new Matrix4().identity().elements);
});

}