import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute} from 'three';
export function testenginenodessopAxesHelper(qUnit: QUnit) {

qUnit.test('sop/axesHelper simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const axesHelper1 = geo1.createNode('axesHelper');

	let container = await axesHelper1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 18);
});

}