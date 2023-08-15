import {TangentMode} from '../../../../src/engine/operations/sop/Tangent';
import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute} from 'three';
export function testenginenodessopTangent(qUnit: QUnit) {
	qUnit.test('sop/tangent for mesh', async (assert) => {
		const geo1 = window.geo1;

		const sphere1 = geo1.createNode('sphere');
		const tangent1 = geo1.createNode('tangent');

		tangent1.setMode(TangentMode.MESH);
		tangent1.setInput(0, sphere1);

		let container = await tangent1.compute();
		let coreGroup = container.coreContent()!;
		const geo = coreGroup.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geo.getAttribute('tangent'));
		assert.ok(geo.getAttribute('tangent'));
		let array = (geo.getAttribute('tangent') as BufferAttribute).array;
		console.log(array[100], array[101], array[102], array[103], array[104], array[105]);
		assert.in_delta(array[100], -0.809, 0.01);
		assert.in_delta(array[101], 0, 0.01);
		assert.in_delta(array[102], 0.587, 0.01);
		assert.equal(array[103], 1);
		assert.in_delta(array[104], -0.669, 0.01);
		assert.in_delta(array[105], 0, 0.01);
	});
	qUnit.test('sop/tangent for curve', async (assert) => {
		const geo1 = window.geo1;

		const line1 = geo1.createNode('line');
		const transform1 = geo1.createNode('transform');
		const tangent1 = geo1.createNode('tangent');

		tangent1.setMode(TangentMode.CURVE);
		transform1.setInput(0, line1);
		tangent1.setInput(0, transform1);
		transform1.p.r.x.set(45);

		let container = await tangent1.compute();
		let coreGroup = container.coreContent()!;
		const geo = coreGroup.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geo.getAttribute('tangent'));
		assert.ok(geo.getAttribute('tangent'));
		let array = (geo.getAttribute('tangent') as BufferAttribute).array;
		assert.equal(array[0], 0);
		assert.in_delta(array[1], 0.707, 0.01);
		assert.in_delta(array[2], 0.707, 0.01);
		assert.equal(array[3], 0);
		assert.in_delta(array[4], 0.707, 0.01);
		assert.in_delta(array[5], 0.707, 0.01);
	});
}
