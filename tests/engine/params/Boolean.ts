QUnit.test('boolean evals correctly when set to different values', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const boolean_param = geo1.p.display;

	boolean_param.set(0);
	assert.equal(boolean_param.value, false);

	boolean_param.set(1);
	assert.equal(boolean_param.value, true);

	boolean_param.set(-1);
	boolean_param.compute();
	assert.equal(boolean_param.value, false);

	boolean_param.set(2);
	boolean_param.compute();
	assert.equal(boolean_param.value, true);
	assert.ok(!boolean_param.has_expression());

	boolean_param.set('$F%2');
	assert.ok(boolean_param.has_expression());
	scene.set_frame(1);
	await boolean_param.compute();
	assert.equal(boolean_param.value, true);

	scene.set_frame(2);
	await boolean_param.compute();
	assert.equal(boolean_param.value, false);

	scene.set_frame(3);
	await boolean_param.compute();
	assert.equal(boolean_param.value, true);
});
