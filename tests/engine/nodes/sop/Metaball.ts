import {MetaballSopNode} from '../../../../src/engine/nodes/sop/Metaball';

async function compute(metaball: MetaballSopNode) {
	const container = await metaball.compute();
	const coreGroup = container.coreContent()!;
	const geometry = coreGroup?.objectsWithGeo()[0].geometry;
	geometry.computeBoundingBox();
	return {bbox: geometry.boundingBox!, coreGroup: coreGroup};
}

QUnit.test('metaball simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const add1 = geo1.createNode('add');
	const metaball1 = geo1.createNode('metaball');
	metaball1.setInput(0, add1);
	metaball1.p.isolation.set(20);

	await metaball1.compute();
	assert.notOk(metaball1.states.error.message());

	let result = await compute(metaball1);
	assert.equal(result.coreGroup.points().length, 1000);
	assert.in_delta(result.bbox.min.x, -0.8, 0.1);
	assert.in_delta(result.bbox.max.x, 0, 0.1);
	assert.in_delta(result.bbox.min.y, -0.8, 0.1);
	assert.in_delta(result.bbox.max.y, 0, 0.1);
	assert.in_delta(result.bbox.min.z, -0.8, 0.1);
	assert.in_delta(result.bbox.max.z, 0, 0.1);

	add1.p.position.set([0.5, 0.5, 0.5]);
	result = await compute(metaball1);
	assert.equal(result.coreGroup.points().length, 1000);
	assert.in_delta(result.bbox.min.x, -0.45, 0.1);
	assert.in_delta(result.bbox.max.x, 0.45, 0.1);
	assert.in_delta(result.bbox.min.y, -0.45, 0.1);
	assert.in_delta(result.bbox.max.y, 0.45, 0.1);
	assert.in_delta(result.bbox.min.z, -0.45, 0.1);
	assert.in_delta(result.bbox.max.z, 0.45, 0.1);

	metaball1.p.resolution.set(2);
	result = await compute(metaball1);
	assert.equal(result.coreGroup.points().length, 8);

	metaball1.p.resolution.set(20);
	result = await compute(metaball1);
	assert.equal(result.coreGroup.points().length, 8000);
});
