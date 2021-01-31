QUnit.test('float eval correctly when set to different values', async (assert) => {
	const geo1 = window.geo1;

	const scale = geo1.p.scale;

	scale.set(2);
	await scale.compute();
	assert.equal(scale.value, 2);

	scale.set('2+1');
	await scale.compute();
	assert.equal(scale.value, 3);

	scale.set('(2+1) * 0.5');
	await scale.compute();
	assert.equal(scale.value, 1.5);
});

QUnit.test('float hasExpression() returns false when removing the expression', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const param = box1.p.size;

	param.set(2);
	assert.notOk(param.hasExpression());

	param.set('2+2');
	assert.ok(param.hasExpression());

	param.set(2);
	assert.notOk(param.hasExpression());

	param.set('-2.5');
	assert.notOk(param.hasExpression());
	assert.equal(param.value, -2.5);

	param.set('-2.5*$F');
	assert.ok(param.hasExpression());
});

QUnit.test('float param can take an expression returning a boolean', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const param = box1.p.size;

	param.set('1+1');
	await param.compute();
	assert.equal(param.value, 2);

	scene.setFrame(1);
	param.set('$F>10');
	await param.compute();
	assert.equal(param.value, 0);

	scene.setFrame(11);
	await param.compute();
	assert.equal(param.value, 1);
});

QUnit.test('serialized value is float if numerical value entered as a string', async (assert) => {
	const geo1 = window.geo1;

	const attrib_create1 = geo1.createNode('attribCreate');
	const param = attrib_create1.p.value1;

	param.set('12.5');
	// this is important when saving nodes,
	// as there was an issue with the icosahedron being saved with details='44' as a string
	// and that created a much larger points count
	// for optimized nodes, as the string was not converted to an int
	assert.equal(param.rawInputSerialized(), 12.5);
});
