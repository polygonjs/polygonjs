import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('anim subnet simple', async (assert) => {
	const scene = window.scene;
	const animNetwork = scene.root().createNode('animationsNetwork');

	const target1 = animNetwork.createNode('target');
	const subnet1 = animNetwork.createNode('subnet');

	assert.notOk(subnet1.states.error.active());
	await subnet1.compute();
	assert.ok(subnet1.states.error.active());
	assert.equal(subnet1.states.error.message(), 'no output node found inside subnet');

	const subnetOutput1 = subnet1.createNode('subnetOutput');
	const easing1 = subnet1.createNode('easing');

	target1.setInput(0, subnet1);

	let container = await target1.compute();
	assert.ok(subnet1.states.error.active());
	assert.equal(subnet1.states.error.message(), 'invalid subnetOutput');

	assert.notOk(target1.isDirty());
	subnetOutput1.setInput(0, easing1);
	assert.ok(target1.isDirty());
	// at the moment, it seems that target1 needs to cook a second time to properly fetch its inputs
	// TODO: investigate why
	await CoreSleep.sleep(100);
	container = await target1.compute();
	assert.notOk(target1.states.error.active(), 'target not errored');
	let timelineBuilder = container.coreContent()!;
	// assert.equal(timelineBuilder.target(), '');
	assert.equal(timelineBuilder.easing(), 'power4.out');
});
