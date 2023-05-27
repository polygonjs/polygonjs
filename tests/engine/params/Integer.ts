import {ParamType} from '../../../src/engine/poly/ParamType';

QUnit.test('int eval correctly when set to different values', async (assert) => {
	const geo1 = window.geo1;

	const switch1 = geo1.createNode('switch');
	const param = switch1.p.input;
	assert.equal(param.type(), ParamType.INTEGER);

	param.set(2);
	await param.compute();
	assert.equal(param.value, 2);

	param.set('2+1');
	await param.compute();
	assert.equal(param.value, 3);

	param.set('(2+1) * 0.5');
	await param.compute();
	assert.equal(param.value, 2);
});

QUnit.test('int hasExpression() returns false when removing the expression', async (assert) => {
	const geo1 = window.geo1;

	const switch1 = geo1.createNode('switch');
	const param = switch1.p.input;
	assert.equal(param.type(), ParamType.INTEGER);

	param.set(2);
	assert.notOk(param.hasExpression());

	param.set('2+2');
	assert.ok(param.hasExpression());

	param.set(2);
	assert.notOk(param.hasExpression());

	param.set('-2');
	assert.notOk(param.hasExpression());
	assert.equal(param.value, 0);
});

QUnit.test('a range will limit the result of an expression', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const lod1 = geo1.createNode('lod');
	const param = lod1.p.hysteresis;

	param.set(1);
	assert.equal(param.value, 1);
	param.set(-1);
	assert.equal(param.value, 0);
	param.set(5);
	assert.equal(param.value, 1);

	param.set('0.1+0.1');
	await param.compute();
	assert.equal(param.value, 0.2);

	scene.setFrame(0);
	param.set('$F');
	await param.compute();
	assert.equal(param.value, 0);

	scene.setFrame(5);
	await param.compute();
	assert.equal(param.value, 1);
});
QUnit.test('integer param can take an expression returning a boolean', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const switch1 = geo1.createNode('switch');
	const param = switch1.p.input;

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

QUnit.test('serialized value is integer if numerical value entered as a string', async (assert) => {
	const geo1 = window.geo1;

	const icosahedron1 = geo1.createNode('icosahedron');
	const param = icosahedron1.p.detail;

	param.set('12');
	// this is important when saving nodes,
	// as there was an issue with the icosahedron being saved with details='44' as a string
	// and that created a much larger points count
	// for optimized nodes, as the string was not converted to an int
	assert.equal(param.rawInputSerialized(), 12);
});
