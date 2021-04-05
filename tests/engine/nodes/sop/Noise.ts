import {NoiseOperation} from '../../../../src/engine/nodes/sop/Noise';

QUnit.test('noise simple', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	sphere1.p.resolution.set([8, 6]);
	const noise1 = geo1.createNode('noise');
	noise1.setInput(0, sphere1);
	noise1.p.useNormals.set(1);

	let container = await noise1.compute();
	// const core_group = container.coreContent();
	// const {geometry} = core_group.objects()[0];

	assert.in_delta(container.boundingBox().max.y, 1.3, 0.1);
	assert.in_delta(container.boundingBox().min.y, -1.3, 0.1);
});

QUnit.test('noise to update a float attribute', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	sphere1.p.resolution.set([8, 6]);
	const scatter = geo1.createNode('scatter');
	scatter.setInput(0, sphere1);
	scatter.p.pointsCount.set(4);
	const noise1 = geo1.createNode('noise');
	noise1.setInput(0, scatter);
	noise1.p.attribName.set('mass');

	let coreContent = (await noise1.compute()).coreContent();
	assert.equal(noise1.states.error.message(), 'attribute mass not found');

	const attribCreate = geo1.createNode('attribCreate');
	attribCreate.p.name.set('mass');
	attribCreate.setInput(0, scatter);
	attribCreate.p.value1.set(1);
	noise1.setInput(0, attribCreate);

	noise1.setOperation(NoiseOperation.SET);
	coreContent = (await noise1.compute()).coreContent();
	assert.notOk(noise1.states.error.active());
	let massAttribArray = coreContent?.objectsWithGeo()[0].geometry.getAttribute('mass').array!;
	assert.in_delta(massAttribArray[0], -0.57, 0.01);
	assert.in_delta(massAttribArray[1], 0.09, 0.01);
	assert.in_delta(massAttribArray[2], -0.19, 0.01);
	assert.in_delta(massAttribArray[3], 0.11, 0.01);

	noise1.setOperation(NoiseOperation.ADD);
	coreContent = (await noise1.compute()).coreContent();
	assert.notOk(noise1.states.error.active());
	massAttribArray = coreContent?.objectsWithGeo()[0].geometry.getAttribute('mass').array!;
	assert.in_delta(massAttribArray[0], 1 - 0.57, 0.01);
	assert.in_delta(massAttribArray[1], 1 + 0.09, 0.01);
	assert.in_delta(massAttribArray[2], 1 - 0.19, 0.01);
	assert.in_delta(massAttribArray[3], 1 + 0.11, 0.01);
});

QUnit.skip('noise on flamingo', (assert) => {
	// load example flamingo glb
	assert.equal(0, 1);
});
