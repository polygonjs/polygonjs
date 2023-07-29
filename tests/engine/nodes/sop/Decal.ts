import type {QUnit} from '../../../helpers/QUnit';
import {Box3, BufferAttribute} from 'three';
export function testenginenodessopDecal(qUnit: QUnit) {
const tmpBox = new Box3();

qUnit.test('decal simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const sphere1 = geo1.createNode('sphere');
	const decal1 = geo1.createNode('decal');

	decal1.setInput(0, sphere1);
	decal1.p.t.set([1, 0, 0]);

	let container = await decal1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 1602);
	container.boundingBox(tmpBox);
	assert.in_delta(tmpBox.min.x, 0.7, 0.1);
	assert.equal(tmpBox.min.y, -0.5);
	assert.in_delta(tmpBox.min.z, -0.5, 0.1);
	assert.in_delta(tmpBox.max.x, 1, 0.1);
	assert.equal(tmpBox.max.y, 0.5);
	assert.in_delta(tmpBox.max.z, 0.5, 0.1);
});

}