import {MetaballSopNode} from '../../../../src/engine/nodes/sop/Metaball';
import {checkConsolePrints} from '../../../helpers/Console';

async function compute(metaball: MetaballSopNode) {
	const container = await metaball.compute();
	const coreGroup = container.coreContent()!;
	const geometry = coreGroup?.threejsObjectsWithGeo()[0].geometry;
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
	metaball1.p.metaStrength.set(1);

	await metaball1.compute();
	assert.notOk(metaball1.states.error.message());

	let result = await compute(metaball1);
	assert.equal(result.coreGroup.points().length, 64000);
	assert.in_delta(result.bbox.min.x, -0.4, 0.1);
	assert.in_delta(result.bbox.max.x, 0.4, 0.1);
	assert.in_delta(result.bbox.min.y, -0.4, 0.1);
	assert.in_delta(result.bbox.max.y, 0.4, 0.1);
	assert.in_delta(result.bbox.min.z, -0.4, 0.1);
	assert.in_delta(result.bbox.max.z, 0.4, 0.1);

	add1.p.position.set([0.5, 0.5, 0.5]);
	result = await compute(metaball1);
	assert.equal(result.coreGroup.points().length, 64000);
	assert.in_delta(result.bbox.min.x, 0, 0.1);
	assert.in_delta(result.bbox.max.x, 0.9, 0.1);
	assert.in_delta(result.bbox.min.y, 0, 0.1);
	assert.in_delta(result.bbox.max.y, 0.9, 0.1);
	assert.in_delta(result.bbox.min.z, 0, 0.1);
	assert.in_delta(result.bbox.max.z, 0.9, 0.1);

	metaball1.p.resolution.set(2);
	result = await compute(metaball1);
	assert.equal(result.coreGroup.points().length, 8);

	metaball1.p.resolution.set(20);
	result = await compute(metaball1);
	assert.equal(result.coreGroup.points().length, 8000);
});

QUnit.test('metaballs can be cloned without warnings', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const add1 = geo1.createNode('add');
	const metaball1 = geo1.createNode('metaball');
	const null1 = geo1.createNode('null');
	metaball1.setInput(0, add1);
	metaball1.p.isolation.set(20);
	null1.setInput(0, metaball1);

	const consoleHistory = await checkConsolePrints(async () => {
		console.warn('metaball start');
		await null1.compute();
		console.warn('metaball end');
	});
	assert.equal(consoleHistory.warn[0][0], 'metaball start');
	assert.equal(consoleHistory.warn[1][0], 'metaball end');
	assert.equal(consoleHistory.warn.length, 2);
	assert.equal(consoleHistory.error.length, 0);
});
