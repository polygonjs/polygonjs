import {BufferAttribute, Box3} from 'three';
const tmpBox = new Box3();

QUnit.test('sop/CSGCenter', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const cube1 = geo1.createNode('CSGBox');
	const translate1 = geo1.createNode('transform');
	const center1 = geo1.createNode('CSGCenter');
	const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

	translate1.setInput(0, cube1);
	center1.setInput(0, translate1);
	CSGTriangulate1.setInput(0, center1);
	translate1.p.t.x.set(1);

	async function computeCenter() {
		const container = await center1.compute();
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

	assert.equal((await computeCenter()).allObjectsCount, 1, '1 object');
	assert.equal((await computeCenter()).threejsObjectsCount, 0, '0 threejs object');
	assert.in_delta(tmpBox.min.x, -0.5, 0.002);
	assert.in_delta(tmpBox.max.x, 0.5, 0.002);

	assert.equal((await computeTriangulate()).allObjectsCount, 1, '1 object');
	assert.equal((await computeTriangulate()).threejsObjectsCount, 1, '1 threejs object');
	const geometry = (await computeTriangulate()).geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 108);
	assert.in_delta(tmpBox.min.x, -0.5, 0.002);
	assert.in_delta(tmpBox.max.x, 0.5, 0.002);
});
