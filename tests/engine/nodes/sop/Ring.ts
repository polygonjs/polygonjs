import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute,Box3} from 'three';
export function testenginenodessopRing(qUnit: QUnit) {
const tmpBox = new Box3()
qUnit.test('sop/ring simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const ring1 = geo1.createNode('ring');

	let container = await ring1.compute();
	const coreGroup = container.coreContent();
	const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 297);
	container.coreContent()!.boundingBox(tmpBox)
	assert.equal(tmpBox.min.x, -1);
	assert.notOk(ring1.isDirty(), 'box is dirty');

	ring1.p.outerRadius.set(2);
	assert.ok(ring1.isDirty(), 'box is dirty');
	container = await ring1.compute();
	assert.ok(!ring1.isDirty(), 'box is not dirty anymore');
	container.coreContent()!.boundingBox(tmpBox)
	assert.equal(tmpBox.min.x, -2.0);
});

}