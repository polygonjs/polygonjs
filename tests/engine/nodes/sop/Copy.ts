import {Object3D} from 'three/src/core/Object3D';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../../src/core/geometry/Constant';

QUnit.test('copy sop simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const plane1 = geo1.createNode('plane');
	const copy1 = geo1.createNode('copy');
	copy1.setInput(0, box1);
	copy1.setInput(1, plane1);
	plane1.p.direction.set([0, 0, 1]);

	let container = await copy1.compute();
	// let core_group = container.coreContent()!;
	// let {geometry} = core_group.objects()[0];

	assert.equal(container.pointsCount(), 96);
	assert.equal(container.boundingBox().min.y, -1.0);

	plane1.p.useSegmentsCount.set(1);
	plane1.p.size.y.set(2);

	container = await copy1.compute();
	// core_group = container.coreContent()!;
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.pointsCount(), 96);
	assert.equal(container.boundingBox().min.y, -1.5);
});

QUnit.test('copy sop with template and stamp', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	const plane1 = geo1.createNode('plane');
	const line1 = geo1.createNode('line');
	const switch1 = geo1.createNode('switch');
	switch1.setInput(0, plane1);
	switch1.setInput(1, box1);
	attrib_create1.setInput(0, switch1);

	const copy1 = geo1.createNode('copy');
	copy1.setInput(0, attrib_create1);
	copy1.setInput(1, line1);
	copy1.p.useCopyExpr.set(0);

	attrib_create1.p.name.set('test');
	attrib_create1.p.value1.set(`1+2*copy('../${copy1.name()}', 0)`);
	switch1.p.input.set(`copy('../${copy1.name()}', 0)`);
	assert.ok(switch1.graphAllPredecessors().includes(copy1.stampNode()));

	let container = await copy1.compute();
	// let core_group = container.coreContent();
	// let { geometry } = group.children[0];

	assert.equal(container.pointsCount(), 8);

	copy1.p.useCopyExpr.set(1);
	container = await copy1.compute();
	// core_group = container.coreContent();
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.pointsCount(), 28);
	const objects = container.coreContent()!.objectsWithGeo();
	assert.equal(objects.length, 2);
	assert.equal(objects[0].geometry.attributes.test.array[0], 1);
	assert.equal(objects[1].geometry.attributes.test.array[0], 3);
});

QUnit.test('copy sop without template and stamp', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const plane1 = geo1.createNode('plane');
	const switch1 = geo1.createNode('switch');
	switch1.setInput(0, plane1);
	switch1.setInput(1, box1);

	const copy1 = geo1.createNode('copy');
	copy1.setInput(0, switch1);
	copy1.p.count.set(3);

	switch1.p.input.set(`copy('../${copy1.name()}', 0) % 2`);
	copy1.p.useCopyExpr.set(0);
	let container = await copy1.compute();
	// let core_group = container.coreContent();
	// let {geometry} = core_group.objects()[0];

	assert.equal(container.pointsCount(), 12);

	copy1.p.useCopyExpr.set(1);
	container = await copy1.compute();
	// core_group = container.coreContent();
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.pointsCount(), 32);
});

QUnit.test('copy sop objects with template and stamp', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	const plane1 = geo1.createNode('plane');

	const copy1 = geo1.createNode('copy');
	attrib_create1.p.class.set(ATTRIBUTE_CLASSES[AttribClass.OBJECT]);
	attrib_create1.setInput(0, box1);
	copy1.setInput(0, attrib_create1);
	copy1.setInput(1, plane1);
	copy1.p.count.set(3);
	copy1.p.useCopyExpr.set(1);

	attrib_create1.p.name.set('test');
	attrib_create1.p.value1.set(`copy('../${copy1.name()}', 0)`);

	let container = await copy1.compute();
	// let core_group = container.coreContent();
	// let {geometry} = core_group.objects()[0];

	const objects = container.coreContent()!.objects();
	assert.equal(objects.length, 4);
	assert.equal(objects[0].userData.attributes.test, 0);
	assert.equal(objects[1].userData.attributes.test, 1);
	assert.equal(objects[2].userData.attributes.test, 2);
	assert.equal(objects[3].userData.attributes.test, 3);
});

QUnit.test('copy sop using a copy stamp expression only triggers the successors once per cook', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const sphere = geo1.createNode('sphere');
	const scatter = geo1.createNode('scatter');
	const roundedBox = geo1.createNode('roundedBox');
	const objectProperties = geo1.createNode('objectProperties');
	const copy = geo1.createNode('copy');
	const attribPromote = geo1.createNode('attribPromote');

	scatter.setInput(0, sphere);
	scatter.p.pointsCount.set(5);

	objectProperties.setInput(0, roundedBox);
	objectProperties.p.tname.set(1);
	objectProperties.p.name.set("box_`copy('../copy1',0)`");

	copy.setInput(0, objectProperties);
	copy.setInput(1, scatter);
	copy.p.useCopyExpr.set(true);

	attribPromote.setInput(0, copy);

	await attribPromote.compute();

	assert.equal(attribPromote.cookController.cooksCount(), 1);

	window.scene.performance.stop();
});
QUnit.test('copy sop switching from useCopyExpr from true to false will give expected results', async (assert) => {
	const geo1 = window.geo1;

	const sphere = geo1.createNode('sphere');
	const scatter = geo1.createNode('scatter');
	const roundedBox = geo1.createNode('roundedBox');
	const objectProperties = geo1.createNode('objectProperties');
	const copy = geo1.createNode('copy');
	const attribPromote = geo1.createNode('attribPromote');

	scatter.setInput(0, sphere);
	scatter.p.pointsCount.set(5);

	objectProperties.setInput(0, roundedBox);
	objectProperties.p.tname.set(1);
	objectProperties.p.name.set("box_`copy('../copy1',0)`");

	copy.setInput(0, objectProperties);
	copy.setInput(1, scatter);
	copy.p.useCopyExpr.set(false);

	attribPromote.setInput(0, copy);

	async function objectNames() {
		const container = await attribPromote.compute();
		return container
			.coreContent()
			?.objects()
			.map((o: Object3D) => o.name);
	}

	assert.deepEqual(await objectNames(), ['box_0', 'box_0', 'box_0', 'box_0', 'box_0']);
	copy.p.useCopyExpr.set(true);
	assert.deepEqual(await objectNames(), ['box_0', 'box_1', 'box_2', 'box_3', 'box_4']);
	copy.p.useCopyExpr.set(false);
	assert.deepEqual(await objectNames(), ['box_0', 'box_0', 'box_0', 'box_0', 'box_0']);
	copy.p.useCopyExpr.set(true);
	assert.deepEqual(await objectNames(), ['box_0', 'box_1', 'box_2', 'box_3', 'box_4']);
});

QUnit.skip('copy sop with group sets an error', (assert) => {});
QUnit.skip(
	'copy with transform_only can update the input 0 with different scale multiple times and give reliable scale',
	(assert) => {
		// create an attrib_create, pipe in input 1
		// set a pscale attrib of 0.5
		// set transform_only to 1
		// check the output size
		// set pscale attrib of 0.25
		// check the output size
		// set pscale attrib of 0.75
		// check the output size
	}
);
QUnit.skip('copy does not modify input 0 with transform_only', (assert) => {});
