import {BufferAttribute} from 'three';
import {BooleanCsgOperationType} from '../../../../src/engine/nodes/csg/Boolean';

QUnit.test('csg/ellipsoid simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const ellipsoid1 = csgNetwork1.createNode('ellipsoid');
	const sphere1 = csgNetwork1.createNode('sphere');
	const boolean1 = csgNetwork1.createNode('boolean');

	boolean1.setInput(0, sphere1);
	boolean1.setInput(1, ellipsoid1);
	ellipsoid1.p.radius.set([2.9, 0.6, 0.6]);
	boolean1.flags.display.set(true);
	boolean1.setOperation(BooleanCsgOperationType.SUBTRACT);

	let container = await csgNetwork1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 7920);
	assert.in_delta(container.boundingBox().min.y, -1, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
