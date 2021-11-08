QUnit.test('metaball simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const add1 = geo1.createNode('add');
	const metaball1 = geo1.createNode('metaball');
	metaball1.setInput(0, add1);

	await metaball1.compute();
	assert.notOk(metaball1.states.error.message());
});
