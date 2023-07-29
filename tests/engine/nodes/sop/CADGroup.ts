import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Box3, Vector3} from 'three';
import {EntityGroupType} from '../../../../src/core/geometry/EntityGroupCollection';
import {BooleanCadOperationType} from '../../../../src/engine/nodes/sop/CADBoolean';
export function testenginenodessopCADGroup(qUnit: QUnit) {
const tmpBox = new Box3();
const tmpSize = new Vector3();

qUnit.test('sop/CADGroup edge', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('CADBox');
	const transform1 = geo1.createNode('transform');
	const group1 = geo1.createNode('CADGroup');
	const fillet1 = geo1.createNode('CADFillet');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	transform1.setInput(0, box1);
	group1.setInput(0, transform1);
	fillet1.setInput(0, group1);
	CADTriangulate1.setInput(0, fillet1);

	const groupName = 'group1';
	group1.p.name.set(groupName);
	group1.setGroupType(EntityGroupType.EDGE);
	group1.p.byExpression.set(true);
	group1.p.expression.set('@ptnum==1');
	fillet1.p.group.set(groupName);
	transform1.p.r.y.set(45);

	async function computeFillet() {
		const container = await fillet1.compute();
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

	await computeFillet();
	assert.in_delta(tmpBox.max.z, 0.665, 0.01);
	assert.in_delta(tmpSize.z, 1.372, 0.01);

	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 270);
	assert.in_delta(tmpBox.max.z, 0.665, 0.01);
	assert.in_delta(tmpSize.z, 1.372, 0.01);

	fillet1.p.radius.set(0.4);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 462);
	assert.in_delta(tmpBox.max.z, 0.541, 0.01);
	assert.in_delta(tmpSize.z, 1.248, 0.01);

	// bypass group node
	group1.flags.bypass.set(true);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 72);
	assert.in_delta(tmpBox.max.z, 0.707, 0.01);
	assert.in_delta(tmpSize.z, 1.4142, 0.01);

	// remove group
	// group1.flags.bypass.set(false);
	fillet1.p.group.set('');
	fillet1.p.radius.set(0.4);
	assert.equal(
		((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length,
		16656
	);
	assert.in_delta(tmpBox.max.z, 0.541, 0.01);
	assert.in_delta(tmpSize.z, 1.082, 0.01);

	// use just an index
	fillet1.p.group.set('1');
	fillet1.p.radius.set(0.1);
	assert.equal(((await computeTriangulate()).geometry.getAttribute('position') as BufferAttribute).array.length, 270);
	assert.in_delta(tmpBox.max.z, 0.665, 0.01);
	assert.in_delta(tmpSize.z, 1.372, 0.01);
});

qUnit.test('sop/CADGroup face', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('CADBox');
	const transform1 = geo1.createNode('transform');
	const boolean1 = geo1.createNode('CADBoolean');
	const group1 = geo1.createNode('CADGroup');
	const thickness1 = geo1.createNode('CADThickness');
	const CADTriangulate1 = geo1.createNode('CADTriangulate');

	transform1.setInput(0, box1);
	boolean1.setOperation(BooleanCadOperationType.SUBTRACT);
	boolean1.setInput(0, box1);
	boolean1.setInput(1, transform1);
	group1.setInput(0, boolean1);
	thickness1.setInput(0, group1);
	CADTriangulate1.setInput(0, thickness1);

	const groupName = 'group1';
	group1.p.name.set(groupName);
	group1.setGroupType(EntityGroupType.FACE);
	group1.p.byExpression.set(true);
	group1.p.expression.set('@ptnum==0 || @ptnum==1 || @ptnum==2');
	thickness1.p.facesGroupToDelete.set(groupName);
	transform1.p.t.set([0.5, 0.5, 0.5]);

	async function computeThickness() {
		const container = await thickness1.compute();
		const coreGroup = container.coreContent()!;
		const allObjectsCount = coreGroup.allObjects().length;
		const threejsObjectsCount = coreGroup.threejsObjects().length;

		container.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);

		return {allObjectsCount, threejsObjectsCount};
	}
	async function computeTriangulate() {
		const container = await CADTriangulate1.compute();
		const coreGroup = container.coreContent();
		const allObjectsCount = coreGroup?.allObjects().length;
		const threejsObjectsCount = coreGroup?.threejsObjects().length;

		const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;

		try {
			container.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);
		} catch (er) {}

		return {allObjectsCount, threejsObjectsCount, geometry};
	}

	await computeThickness();
	assert.in_delta(tmpBox.min.x, -0.501, 0.01);
	assert.in_delta(tmpSize.x, 1.002, 0.01);

	assert.equal(
		((await computeTriangulate()).geometry!.getAttribute('position') as BufferAttribute).array.length,
		1863
	);
	assert.in_delta(tmpBox.min.x, -0.5, 0.01);
	assert.in_delta(tmpSize.x, 1, 0.01);

	// bypass group node
	group1.flags.bypass.set(true);
	assert.equal(
		((await computeTriangulate()).geometry!.getAttribute('position') as BufferAttribute).array.length,
		1755
	);

	assert.in_delta(tmpBox.min.x, -0.4, 0.01);
	assert.in_delta(tmpSize.x, 0.8, 0.01);

	// remove group
	// thickness1.p.facesGroupToDelete.set('');
	// await computeTriangulate();
	// assert.ok(CADTriangulate1.states.error.message());

	// // use just an index
	thickness1.p.facesGroupToDelete.set('1');
	assert.equal(
		((await computeTriangulate()).geometry!.getAttribute('position') as BufferAttribute).array.length,
		1881
	);
	assert.in_delta(tmpBox.min.z, -0.5, 0.01);
	assert.in_delta(tmpSize.z, 1, 0.01);
});

}