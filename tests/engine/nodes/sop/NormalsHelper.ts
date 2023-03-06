QUnit.test('normalsHelper simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const sphere1 = geo1.createNode('sphere');
	const normalsHelper = geo1.createNode('normalsHelper');
	normalsHelper.setInput(0, sphere1);

	let container = await normalsHelper.compute();
	assert.equal(container.coreContent()!.threejsObjects().length, 2);

	normalsHelper.p.keepInput.set(0);
	container = await normalsHelper.compute();
	assert.equal(container.coreContent()!.threejsObjects().length, 1);
});
