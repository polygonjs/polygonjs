import {Object3D} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {AXISES, Axis, SortMode} from '../../../../src/engine/operations/sop/Sort';

QUnit.test('sop/sort simple with mesh axis', async (assert) => {
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

	window.scene.setFrame(1);
	let coreGroup = (await delete1.compute()).coreContent()!;
	assert.equal(coreGroup.boundingBox().min.y, Infinity);
	assert.equal(coreGroup.boundingBox().max.y, -Infinity);

	window.scene.setFrame(10);
	coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta(coreGroup.boundingBox().min.y, 0.35, 0.1);
	assert.in_delta(coreGroup.boundingBox().max.y, 0.85, 0.1);

	window.scene.setFrame(30);
	coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta(coreGroup.boundingBox().min.y, -0.85, 0.1);
	assert.in_delta(coreGroup.boundingBox().max.y, 0.85, 0.1);
});

QUnit.test('sop/sort simple with mesh random', async (assert) => {
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
				?.objects()
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
QUnit.test('sop/sort simple with points axis', async (assert) => {
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

	window.scene.setFrame(1);
	let coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta(coreGroup.boundingBox().min.y, 0.76, 0.1);
	assert.in_delta(coreGroup.boundingBox().max.y, 0.76, 0.1);

	window.scene.setFrame(10);
	coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta(coreGroup.boundingBox().min.y, 0.48, 0.1);
	assert.in_delta(coreGroup.boundingBox().max.y, 0.76, 0.1);

	window.scene.setFrame(30);
	coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta(coreGroup.boundingBox().min.y, 0.29, 0.1);
	assert.in_delta(coreGroup.boundingBox().max.y, 0.76, 0.1);

	window.scene.setFrame(80);
	coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta(coreGroup.boundingBox().min.y, -0.3, 0.1);
	assert.in_delta(coreGroup.boundingBox().max.y, 0.76, 0.1);

	window.scene.setFrame(100);
	coreGroup = (await delete1.compute()).coreContent()!;
	assert.in_delta(coreGroup.boundingBox().min.y, -0.76, 0.1);
	assert.in_delta(coreGroup.boundingBox().max.y, 0.76, 0.1);
});
