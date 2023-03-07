import {BooleanCsgOperationType} from '../../../../src/engine/nodes/sop/CSGBoolean';
import {BufferAttribute, Box3} from 'three';
const tmpBox = new Box3();

QUnit.test('sop/CSGEllipse simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const ellipse1 = geo1.createNode('CSGEllipse');
	const rectangle1 = geo1.createNode('CSGRectangle');
	const boolean1 = geo1.createNode('CSGBoolean');
	const CSGTriangulate1 = geo1.createNode('CSGTriangulate');

	boolean1.setInput(0, ellipse1);
	boolean1.setInput(1, rectangle1);
	ellipse1.p.radius.set([1.2, 0.6]);
	rectangle1.p.center.set([0.7, 0]);
	boolean1.flags.display.set(true);
	boolean1.setOperation(BooleanCsgOperationType.SUBTRACT);
	CSGTriangulate1.setInput(0, boolean1);

	async function computeBoolean() {
		const container = await boolean1.compute();
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

	await computeBoolean();
	assert.in_delta(tmpBox.min.x, -1.199, 0.002);
	assert.in_delta(tmpBox.max.x, 0.66, 0.01);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 150);
	assert.in_delta(tmpBox.min.x, -1.199, 0.002);
	assert.in_delta(tmpBox.max.x, 0.66, 0.01);
});
