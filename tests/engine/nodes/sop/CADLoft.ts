import {BufferAttribute, Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('sop/CADLoft simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const rectangle1 = geo1.createNode('CADRectangle');
	const transform1 = geo1.createNode('transform');
	const merge1 = geo1.createNode('merge');
	const loft1 = geo1.createNode('CADLoft');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	transform1.setInput(0, rectangle1);
	merge1.setInput(0, rectangle1);
	merge1.setInput(1, transform1);
	loft1.setInput(0, merge1);
	CADTriangulate1.setInput(0, loft1);

	transform1.p.t.y.set(1);

	async function computeLoft() {
		const container = await loft1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CADTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	await computeLoft();
	assert.in_delta(tmpSize.x, 1, 0.01);
	assert.in_delta(tmpSize.y, 1, 0.01);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 864);
	assert.in_delta(tmpSize.x, 1, 0.01);
	assert.in_delta(tmpSize.y, 1, 0.01);

	rectangle1.p.size.x.set(2);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 864);
	assert.in_delta(tmpSize.x, 2, 0.01);
	assert.in_delta(tmpSize.y, 1, 0.01);
});

QUnit.test('sop/CADLoft with sop/copy', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const rectangle1 = geo1.createNode('CADRectangle');
	const copy1 = geo1.createNode('copy');
	const loft1 = geo1.createNode('CADLoft');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	copy1.setInput(0, rectangle1);
	loft1.setInput(0, copy1);
	CADTriangulate1.setInput(0, loft1);

	copy1.p.count.set(4);
	copy1.p.t.y.set(1);
	copy1.p.t.x.set(1);

	async function computeLoft() {
		const container = await loft1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CADTriangulate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	await computeLoft();
	assert.in_delta(tmpSize.x, 4.0, 0.01);
	assert.in_delta(tmpSize.y, 3, 0.01);

	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		1776
	);
	assert.in_delta(tmpSize.x, 4, 0.01);
	assert.in_delta(tmpSize.y, 3, 0.01);

	copy1.p.count.set(20);
	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		9072
	);
	assert.in_delta(tmpSize.x, 20, 0.01);
	assert.in_delta(tmpSize.y, 19, 0.01);
});
