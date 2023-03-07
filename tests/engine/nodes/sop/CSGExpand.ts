import {BufferAttribute, Box3} from 'three';
const tmpBox = new Box3();

QUnit.test('sop/CSGExpand with 2D primitive', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const arc1 = geo1.createNode('CSGArc');
	const expand1 = geo1.createNode('CSGExpand');
	const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

	expand1.setInput(0, arc1);
	CSGTriangulate1.setInput(0, expand1);

	async function computeExpand() {
		const container = await expand1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CSGTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	await computeExpand();
	assert.in_delta(tmpBox.min.x, -1.099, 0.002);
	assert.in_delta(tmpBox.max.x, 1.099, 0.002);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 324);
	assert.in_delta(tmpBox.min.x, -1.099, 0.002);
	assert.in_delta(tmpBox.max.x, 1.099, 0.002);

	expand1.p.delta.set(0.5);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 324);
	assert.in_delta(tmpBox.min.x, -1.497, 0.002);
	assert.in_delta(tmpBox.max.x, 1.497, 0.002);

	expand1.p.segments.set(5);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 420);
	assert.in_delta(tmpBox.min.x, -1.497, 0.002);
	assert.in_delta(tmpBox.max.x, 1.497, 0.002);
});
