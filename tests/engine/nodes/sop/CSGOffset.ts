import {BufferAttribute, Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('sop/CSGOffset on 2d prim', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const arc1 = geo1.createNode('CSGArc');
	const offset1 = geo1.createNode('CSGOffset');
	const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

	offset1.setInput(0, arc1);
	offset1.p.delta.set(0.1);
	offset1.flags.display.set(true);
	CSGTriangulate1.setInput(0, offset1);

	async function computeOffset() {
		const container = await offset1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CSGTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	await computeOffset();
	assert.in_delta(tmpSize.x, 2.199, 0.1, 'size x');

	assert.equal((await computeOffset()).allObjectsCount, 1, '1 object');
	assert.equal((await computeOffset()).threejsObjectsCount, 0, '0 threejs object');
	assert.equal((await computeTriangulate()).allObjectsCount, 1, '1 object');
	assert.equal((await computeTriangulate()).threejsObjectsCount, 1, '1 threejs object');

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 102);
	assert.in_delta(tmpBox.min.x, -1.099, 0.002);
	assert.in_delta(tmpBox.max.x, 1.099, 0.002);

	offset1.p.delta.set(0.1);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 102);
	assert.in_delta(tmpBox.min.x, -1.099, 0.002);
	assert.in_delta(tmpBox.max.x, 1.099, 0.002);
});

// QUnit.test('SOP/CSGOffset on 3d prim', async (assert) => {
// 	const geo1 = window.geo1;
// 	geo1.flags.display.set(false); // cancels geo node displayNodeController

// 	const box1 = geo1.createNode('CSGBox');
// 	const offset1 = geo1.createNode('CSGOffset');
// 	const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

// 	offset1.setInput(0, box1);
// 	offset1.p.delta.set(0.1);
// 	offset1.flags.display.set(true);
// 	CSGTriangulate1.setInput(0, offset1);

// 	async function computeOffset() {
// 		const container = await offset1.compute();
// 		const coreGroup = container.coreContent()!;
// 		const allObjectsCount = coreGroup.allObjects().length;
// 		const threejsObjectsCount = coreGroup.threejsObjects().length;

// 		container.boundingBox(tmpBox);
// 		tmpBox.getSize(tmpSize);

// 		return {allObjectsCount, threejsObjectsCount};
// 	}
// 	async function computeTriangulate() {
// 		const container = await CSGTriangulate1.compute();
// 		const coreGroup = container.coreContent()!;
// 		const allObjectsCount = coreGroup.allObjects().length;
// 		const threejsObjectsCount = coreGroup.threejsObjects().length;

// 		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

// 		container.boundingBox(tmpBox);
// 		tmpBox.getSize(tmpSize);

// 		return {allObjectsCount, threejsObjectsCount, geometry};
// 	}

// 	await computeOffset();
// 	assert.in_delta(tmpSize.x, 1, 0.1, 'size x');

// 	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 108);
// 	assert.in_delta(tmpBox.min.x, -0.5, 0.002);
// 	assert.in_delta(tmpBox.max.x, 0.5, 0.002);

// 	offset1.p.delta.set(0.1);
// 	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 108);
// 	assert.in_delta(tmpBox.min.x, -1.099, 0.002);
// 	assert.in_delta(tmpBox.max.x, 1.099, 0.002);
// });
