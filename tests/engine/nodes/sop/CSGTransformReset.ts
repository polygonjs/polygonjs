import {BufferAttribute, Box3, Vector3} from 'three';
import {TransformTargetType} from '../../../../src/core/Transform';
const tmpBox = new Box3();
const tmpSize = new Vector3();

QUnit.test('sop/CSGTransformReset', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('CSGBox');
	const translate1 = geo1.createNode('transform');
	const transformReset1 = geo1.createNode('CSGTransformReset');
	const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

	translate1.setInput(0, box1);
	transformReset1.setInput(0, translate1);
	translate1.p.t.x.set(1);
	translate1.setApplyOn(TransformTargetType.OBJECT);
	// transformReset1.flags.display.set(true);
	CSGTriangulate1.setInput(0, transformReset1);

	async function computeTransform() {
		const container = await translate1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTransformReset() {
		const container = await transformReset1.compute();
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

	await computeTransform();
	assert.in_delta(tmpSize.x, 1, 0.1, 'size x');
	assert.in_delta(tmpBox.min.x, 0.5, 0.002);
	assert.in_delta(tmpBox.max.x, 1.5, 0.002);

	await computeTransformReset();
	assert.in_delta(tmpSize.x, 1, 0.1, 'size x');
	assert.in_delta(tmpBox.min.x, -0.5, 0.002);
	assert.in_delta(tmpBox.max.x, 0.5, 0.002);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 108);
	assert.in_delta(tmpBox.min.x, -0.5, 0.002);
	assert.in_delta(tmpBox.max.x, 0.5, 0.002);

	transformReset1.p.extract.set(1);
	await computeTriangulate();
	assert.in_delta(tmpBox.min.x, 0.5, 0.002);
	assert.in_delta(tmpBox.max.x, 1.5, 0.002);
});
