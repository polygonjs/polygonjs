import {BufferAttribute, Box3} from 'three';
const tmpBox = new Box3();

QUnit.test('csg/project', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const arc1 = csgNetwork1.createNode('arc');
	const expand1 = csgNetwork1.createNode('expand');
	const extrudeRotate1 = csgNetwork1.createNode('extrudeRotate');
	const project1 = csgNetwork1.createNode('project');

	expand1.setInput(0, arc1);
	extrudeRotate1.setInput(0, expand1);
	project1.setInput(0, extrudeRotate1);
	project1.flags.display.set(true);

	await csgNetwork1.compute();

	let container = await csgNetwork1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 216);
	container.boundingBox(tmpBox);
	assert.in_delta(tmpBox.min.x, -1.099, 0.002);
	assert.in_delta(tmpBox.max.x, 1.099, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
