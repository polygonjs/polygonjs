import {AXISES, Axis} from '../../../../src/engine/operations/sop/Sort';

QUnit.test('sort simple with mesh', async (assert) => {
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

QUnit.test('sort simple with points', async (assert) => {
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
