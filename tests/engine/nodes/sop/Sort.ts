import type {QUnit} from '../../../helpers/QUnit';
import {Object3D, Box3} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {AXISES, Axis, SortMode} from '../../../../src/engine/operations/sop/Sort';
import {SortSopNode} from '../../../../src/engine/nodes/sop/Sort';
import {MergeSopNode} from '../../../../src/engine/nodes/sop/Merge';
export function testenginenodessopSort(qUnit: QUnit) {
const tmpBox = new Box3();
qUnit.test('sop/sort simple with mesh axis', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const transform = geo1.createNode('transform');
	const sort = geo1.createNode('sort');
	const delete1 = geo1.createNode('delete');

	transform.setInput(0, box1);
	transform.p.r.set([45, 0, 45]);
	sort.setInput(0, transform);
	sort.p.axis.set(AXISES.indexOf(Axis.Y));
	sort.p.invert.set(true);
	delete1.setInput(0, sort);
	delete1.p.byExpression.set(true);
	delete1.p.expression.set('@ptnum>=$F');

	async function compute() {
		const container = await delete1.compute();
		const coreGroup = container.coreContent()!;
		coreGroup.boundingBox(tmpBox);

		return {bbox: tmpBox, pointsCount: coreGroup.pointsCount()};
	}

	window.scene.setFrame(1);
	// let coreGroup = (await delete1.compute()).coreContent()!;
	assert.equal((await compute()).bbox.min.y, Infinity);
	assert.equal((await compute()).bbox.max.y, -Infinity);

	window.scene.setFrame(10);
	// coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta((await compute()).bbox.min.y, 0.35, 0.1);
	assert.in_delta((await compute()).bbox.max.y, 0.85, 0.1);

	window.scene.setFrame(30);
	// coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta((await compute()).bbox.min.y, -0.85, 0.1);
	assert.in_delta((await compute()).bbox.max.y, 0.85, 0.1);
});

qUnit.test('sop/sort simple with mesh random', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const copy1 = geo1.createNode('copy');
	const sort1 = geo1.createNode('sort');
	const objectProperties1 = geo1.createNode('objectProperties');

	copy1.setInput(0, box1);
	copy1.p.count.set(3);
	copy1.p.t.x.set(1);
	objectProperties1.setInput(0, copy1);
	objectProperties1.p.tname.set(1);
	objectProperties1.p.name.set('obj-`@ptnum`');

	sort1.setTargetType(AttribClass.OBJECT);
	sort1.setInput(0, objectProperties1);
	sort1.setSortMode(SortMode.RANDOM);

	async function objectNames(): Promise<string[]> {
		const container = await sort1.compute();
		return (
			container
				.coreContent()
				?.threejsObjects()
				.map((o: Object3D) => o.name || '') || []
		);
	}

	assert.deepEqual(await objectNames(), ['obj-0', 'obj-1', 'obj-2']);

	sort1.p.seed.set(1);
	assert.deepEqual(await objectNames(), ['obj-1', 'obj-0', 'obj-2']);

	sort1.p.seed.set(2);
	assert.deepEqual(await objectNames(), ['obj-0', 'obj-2', 'obj-1']);

	sort1.p.invert.set(true);
	assert.deepEqual(await objectNames(), ['obj-1', 'obj-2', 'obj-0']);
});
qUnit.test('sop/sort simple with points axis', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const transform = geo1.createNode('transform');
	const scatter = geo1.createNode('scatter');
	const sort = geo1.createNode('sort');
	const delete1 = geo1.createNode('delete');

	transform.setInput(0, box1);
	transform.p.r.set([45, 0, 45]);
	scatter.setInput(0, transform);
	sort.setInput(0, scatter);
	sort.p.axis.set(AXISES.indexOf(Axis.Y));
	sort.p.invert.set(true);
	delete1.setInput(0, sort);
	delete1.p.byExpression.set(true);
	delete1.p.expression.set('@ptnum>=$F');

	async function compute() {
		const container = await delete1.compute();
		const coreGroup = container.coreContent()!;
		coreGroup.boundingBox(tmpBox);

		return {bbox: tmpBox, pointsCount: coreGroup.pointsCount()};
	}

	window.scene.setFrame(1);
	// let coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta((await compute()).bbox.min.y, 0.76, 0.1);
	assert.in_delta((await compute()).bbox.max.y, 0.76, 0.1);

	window.scene.setFrame(10);
	// coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta((await compute()).bbox.min.y, 0.48, 0.1);
	assert.in_delta((await compute()).bbox.max.y, 0.76, 0.1);

	window.scene.setFrame(30);
	// coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta((await compute()).bbox.min.y, 0.29, 0.1);
	assert.in_delta((await compute()).bbox.max.y, 0.76, 0.1);

	window.scene.setFrame(80);
	// coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta((await compute()).bbox.min.y, -0.3, 0.1);
	assert.in_delta((await compute()).bbox.max.y, 0.76, 0.1);

	window.scene.setFrame(100);
	// coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta((await compute()).bbox.min.y, -0.76, 0.1);
	assert.in_delta((await compute()).bbox.max.y, 0.76, 0.1);
});

qUnit.test('sop/sort objects by attributes', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const copy1 = geo1.createNode('copy');
	const attribId1 = geo1.createNode('attribId');
	const objectProperties1 = geo1.createNode('objectProperties');
	const delete1 = geo1.createNode('delete');
	const delete2 = geo1.createNode('delete');
	const merge1 = geo1.createNode('merge');
	const sort1 = geo1.createNode('sort');

	copy1.setInput(0, box1);
	attribId1.setInput(0, copy1);
	objectProperties1.setInput(0, attribId1);
	delete1.setInput(0, objectProperties1);
	delete2.setInput(0, objectProperties1);
	merge1.setInput(0, delete1);
	merge1.setInput(1, delete2);
	sort1.setInput(0, merge1);

	copy1.p.count.set(4);
	const deleteNodes = [delete1, delete2];
	for (const deleteNode of deleteNodes) {
		deleteNode.setAttribClass(AttribClass.OBJECT);
		deleteNode.p.byAttrib.set(true);
		deleteNode.p.attribName.set('id');
		deleteNode.p.attribValue1.set(2);
	}
	delete2.p.invert.set(true);

	attribId1.setAttribClass(AttribClass.OBJECT);
	objectProperties1.p.tname.set(true);
	objectProperties1.p.name.set('obj-`@id`');
	sort1.setTargetType(AttribClass.OBJECT);
	sort1.setSortMode(SortMode.ATTRIBUTE);
	sort1.p.attribute.set('id');

	const objectNames = async (node: SortSopNode | MergeSopNode) => {
		const container = await node.compute();
		return (
			container
				.coreContent()
				?.threejsObjects()
				.map((o: Object3D) => o.name || '') || []
		);
	};
	assert.deepEqual(await objectNames(merge1), ['obj-0', 'obj-1', 'obj-3', 'obj-2'], 'merge node');
	assert.deepEqual(await objectNames(sort1), ['obj-0', 'obj-1', 'obj-2', 'obj-3'], 'sort node');
});

}