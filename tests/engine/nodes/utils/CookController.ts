QUnit.test('nodes/cookController bypassed input works as expected when changing node params', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attribCreate1 = geo1.createNode('attribCreate');
	const attribSetAtIndex1 = geo1.createNode('attribSetAtIndex');

	attribCreate1.flags.bypass.set(true);
	attribCreate1.setInput(0, plane1);
	attribSetAtIndex1.setInput(0, attribCreate1);

	await attribSetAtIndex1.compute();
	assert.notOk(attribSetAtIndex1.states.error.active());

	attribSetAtIndex1.p.value1.set(1);
	await attribSetAtIndex1.compute();
	assert.notOk(attribSetAtIndex1.states.error.active());

	attribSetAtIndex1.p.value1.set(2);
	await attribSetAtIndex1.compute();
	assert.notOk(attribSetAtIndex1.states.error.active());
});
