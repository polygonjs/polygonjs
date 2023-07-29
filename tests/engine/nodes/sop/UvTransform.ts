import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute} from 'three';
export function testenginenodessopUvTransform(qUnit: QUnit) {

qUnit.test('UvTransform simple', async (assert) => {
	const geo1 = window.geo1;
	const plane = geo1.createNode('plane');
	const uvTransform = geo1.createNode('uvTransform');

	uvTransform.setInput(0, plane);

	async function assertUv(array: number[]) {
		let container = await uvTransform.compute();
		let core_group = container.coreContent()!;
		let geometry0 = core_group.threejsObjectsWithGeo()[0].geometry;
		assert.deepEqual(
			((geometry0.getAttribute('uv') as BufferAttribute).array as number[]).join(','),
			array.join(',')
		);
	}

	await assertUv([0, 1, 1, 1, 0, 0, 1, 0]);

	uvTransform.p.pivot.set([0.5, 0.5]);
	await assertUv([0, 1, 1, 1, 0, 0, 1, 0]);

	uvTransform.p.s.set([0.5, 0.5]);
	await assertUv([0.25, 0.75, 0.75, 0.75, 0.25, 0.25, 0.75, 0.25]);
});

}