QUnit.test('int eval correctly when set to different values', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const param = box1.p.divisions;

	param.set(2);
	await param.compute();
	assert.equal(param.value, 2);

	param.set('2+1');
	await param.compute();
	assert.equal(param.value, 3);

	param.set('(2+1) * 0.5');
	await param.compute();
	assert.equal(param.value, 1.5);
});

QUnit.test('int has_expression() returns false when removing the expression', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const param = box1.p.divisions;

	param.set(2);
	assert.notOk(param.has_expression());

	param.set('2+2');
	assert.ok(param.has_expression());

	param.set(2);
	assert.notOk(param.has_expression());
});

QUnit.test('a range will limit the result of an expression', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const switch1 = geo1.create_node('switch');
	const param = switch1.p.input;

	param.set(1);
	assert.equal(param.value, 1);
	param.set(-1);
	assert.equal(param.value, 0);
	param.set(5);
	assert.equal(param.value, 3);

	param.set('1+1');
	await param.compute();
	assert.equal(param.value, 2);

	scene.set_frame(1);
	param.set('$F');
	await param.compute();
	assert.equal(param.value, 1);

	scene.set_frame(5);
	await param.compute();
	assert.equal(param.value, 3);
});
