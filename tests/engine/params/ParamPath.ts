QUnit.test('param/paramPath: expression simple', async (assert) => {
	const geo1 = window.geo1;
	const eventsNetwork1 = geo1.createNode('eventsNetwork');
	const raycast1 = eventsNetwork1.createNode('raycast');
	const raycast2 = eventsNetwork1.createNode('raycast');
	const plane1 = geo1.createNode('plane');

	raycast1.p.positionTarget.setParam(plane1.p.center);
	raycast2.p.positionTarget.set(`\`chsop("${raycast1.p.positionTarget.path()}")\``);

	await raycast1.p.positionTarget.compute();
	await raycast2.p.positionTarget.compute();

	assert.equal(raycast1.pv.positionTarget.param()?.graphNodeId(), plane1.p.center.graphNodeId());
	assert.equal(raycast2.pv.positionTarget.param()?.graphNodeId(), plane1.p.center.graphNodeId());
});
