import {BufferAttribute, Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('sop/CADCurveFromPoints simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const point1 = geo1.createNode('CADPoint');
	const transform1 = geo1.createNode('CADTransform');
	const transform2 = geo1.createNode('CADTransform');
	const transform3 = geo1.createNode('transform');
	const transform4 = geo1.createNode('transform');
	const merge1 = geo1.createNode('merge');
	const curveFromPoints1 = geo1.createNode('CADCurveFromPoints');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	transform1.setInput(0, point1);
	transform2.setInput(0, point1);
	transform3.setInput(0, point1);
	transform4.setInput(0, point1);
	merge1.setInput(0, transform1);
	merge1.setInput(1, transform2);
	merge1.setInput(2, transform3);
	merge1.setInput(3, transform4);
	curveFromPoints1.setInput(0, merge1);
	CADTriangulate1.setInput(0, curveFromPoints1);

	transform1.p.t.set([1, 0, 0]);
	transform2.p.t.set([0, 1, 0]);
	transform3.p.t.set([0, 0, 1]);
	transform4.p.t.set([-1, 0, 0]);

	async function computeCurveFromPoints() {
		const container = await curveFromPoints1.compute();
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

	await computeCurveFromPoints();
	assert.in_delta(tmpBox.min.y, 0, 0.01);
	assert.in_delta(tmpSize.y, 0.6589, 0.01);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 78);
	assert.in_delta(tmpBox.min.y, 0, 0.01);
	assert.in_delta(tmpSize.y, 0.4437, 0.01);

	transform2.p.t.y.set(4);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 138);
	assert.in_delta(tmpBox.min.y, 0.0, 0.01);
	assert.in_delta(tmpSize.y, 1.777, 0.01);
});
