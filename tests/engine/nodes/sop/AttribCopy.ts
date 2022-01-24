import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';

QUnit.test('attribcopy latitude to position', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');

	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('latitude');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');
	attrib_create1.setInput(0, plane1);

	const attrib_create2 = geo1.createNode('attribCreate');
	attrib_create2.p.name.set('longitude');
	attrib_create2.p.size.set(1);
	attrib_create2.p.value1.set('2*@ptnum+1');
	attrib_create2.setInput(0, attrib_create1);

	const attrib_copy1 = geo1.createNode('attribCopy');
	attrib_copy1.setInput(0, attrib_create2);
	attrib_copy1.setInput(1, attrib_create2);

	attrib_copy1.p.name.set('latitude');
	attrib_copy1.p.tnewName.set(1);
	attrib_copy1.p.newName.set('position');
	// attrib_copy1.param('to_all_components').set(0);
	// attrib_copy1.param('src_component').set(0);
	// attrib_copy1.param('dest_component').set(0);

	let container = await attrib_copy1.compute();
	assert.notOk(attrib_copy1.states.error.message(), 'no error');
	let core_group = container.coreContent()!;
	let geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group, 'core group exists');
	assert.ok(geometry, 'geometry exists');

	let {array} = geometry.getAttribute('position');
	assert.equal(array.length, container.pointsCount() * 3, 'array is 3x the points count');
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[2], -0.5);
	assert.equal(array[5], -0.5);
	assert.equal(array[8], +0.5);

	const attrib_copy2 = geo1.createNode('attribCopy');
	attrib_copy2.setInput(0, attrib_copy1);
	attrib_copy2.setInput(1, attrib_copy1);

	attrib_copy2.p.name.set('longitude');
	attrib_copy2.p.tnewName.set(1);
	attrib_copy2.p.newName.set('position');
	attrib_copy2.p.destOffset.set(2);
	// attrib_copy2.param('to_all_components').set(0);
	// attrib_copy2.param('src_component').set(0);
	// attrib_copy2.param('dest_component').set(2);

	container = await attrib_copy2.compute();
	assert.notOk(attrib_copy2.states.error.message());
	core_group = container.coreContent()!;
	geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	array = geometry.getAttribute('position').array;
	assert.equal(array.length, container.pointsCount() * 3, 'array is 3x points_count');
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[2], 1);
	assert.equal(array[5], 3);
	assert.equal(array[8], 5);
});

async function requestAttribArray(assert: Assert, node: BaseSopNodeType, attribName: string) {
	let container = await node.compute();
	assert.notOk(node.states.error.message());
	let core_group = container.coreContent()!;
	let geometry = core_group.objectsWithGeo()[0].geometry;
	return geometry.getAttribute(attribName).array;
}

QUnit.test('attribcopy from input 2', async (assert) => {
	const geo1 = window.geo1;
	const box = geo1.createNode('box');
	box.p.size.set(1.1); // non integer to allow the noise to have any effect
	const noise = geo1.createNode('noise');
	const attribCopy = geo1.createNode('attribCopy');
	noise.setInput(0, box);
	noise.p.amplitude.set(5);

	attribCopy.setInput(0, box);
	attribCopy.setInput(1, noise);
	attribCopy.p.name.set('P');

	const boxP = await requestAttribArray(assert, box, 'position');
	const noiseP = await requestAttribArray(assert, noise, 'position');

	//
	// 1. we test that the attrib is copied to the dest with same name
	//
	let attribCopyP = await requestAttribArray(assert, attribCopy, 'position');
	assert.deepEqual(attribCopyP, noiseP);

	//
	// 2. we test that the attrib is copied to the dest with a different name
	//
	attribCopy.p.tnewName.set(true);
	attribCopy.p.newName.set('P2');

	attribCopyP = await requestAttribArray(assert, attribCopy, 'position');
	const attribCopyP2 = await requestAttribArray(assert, attribCopy, 'P2');
	assert.deepEqual(attribCopyP2, noiseP);
	assert.deepEqual(attribCopyP, boxP);
});
