import {ParamType} from '../../../src/engine/poly/ParamType';
import {CoreGraphNode} from '../../../src/core/graph/CoreGraphNode';

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

	boolean_param.set('true');
	assert.ok(!boolean_param.has_expression(), '"true" does not create an expression');
	assert.equal(boolean_param.value, true);

	boolean_param.set('false');
	assert.ok(!boolean_param.has_expression(), '"false" does not create an expression');
	assert.equal(boolean_param.value, false);

	boolean_param.set('1');
	assert.ok(!boolean_param.has_expression(), '"1" does not create an expression');
	assert.equal(boolean_param.value, true);

	boolean_param.set('0');
	assert.ok(!boolean_param.has_expression(), '"0" does not create an expression');
	assert.equal(boolean_param.value, false);

	boolean_param.set('-2');
	assert.ok(!boolean_param.has_expression(), '"-2" does not create an expression');
	assert.equal(boolean_param.value, false);

	boolean_param.set('-2.5');
	assert.ok(!boolean_param.has_expression(), '"-2.5" does not create an expression');
	assert.equal(boolean_param.value, false);

	boolean_param.set('0+1');
	assert.ok(boolean_param.has_expression());
	await boolean_param.compute();
	assert.equal(boolean_param.value, true);
});

QUnit.test('boolean is_default', async (assert) => {
	const geo1 = window.geo1;

	const boolean_param = geo1.p.display;
	assert.ok(boolean_param.is_default);

	boolean_param.set(0);
	assert.ok(!boolean_param.is_default);

	boolean_param.set('1*2*0.5');
	boolean_param.compute();
	assert.ok(!boolean_param.is_default);

	boolean_param.set(1);
	boolean_param.compute();
	assert.ok(boolean_param.is_default);
});
QUnit.test('boolean is_default for spare with expression', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	scene.time_controller.set_frame_range(-10, 10);

	const spare_boolean = geo1.add_param(ParamType.BOOLEAN, 'spare_boolean', '$F', {spare: true})!;
	assert.deepEqual(
		spare_boolean.graph_all_predecessors().map((n: CoreGraphNode) => n.graph_node_id),
		[scene.time_controller.graph_node.graph_node_id]
	);
	assert.ok(spare_boolean.has_expression(), 'has expr');
	assert.ok(spare_boolean.is_default, 'spare is default');

	scene.set_frame(2);
	await spare_boolean.compute();
	assert.ok(spare_boolean.is_default, 'spare is default');
	assert.ok(spare_boolean.value === true, 'value is true');

	scene.set_frame(1);
	await spare_boolean.compute();
	assert.ok(spare_boolean.is_default, 'spare is default');
	assert.ok(spare_boolean.value === true, 'value is true');

	scene.set_frame(-1);
	await spare_boolean.compute();
	assert.ok(spare_boolean.is_default, 'param is default');
	assert.ok(spare_boolean.value === false, 'value is false');

	scene.set_frame(1);
	await spare_boolean.compute();
	assert.ok(spare_boolean.is_default, 'spare is default');
	assert.ok(spare_boolean.value === true, 'value is true');

	scene.set_frame(0);
	await spare_boolean.compute();
	assert.ok(spare_boolean.is_default, 'param is default');
	assert.ok(spare_boolean.value === false, 'value is false');

	spare_boolean.set(1);
	assert.ok(!spare_boolean.is_default);
	assert.ok(spare_boolean.value === true, 'value is true');
	spare_boolean.set(0);
	assert.ok(!spare_boolean.is_default);
	assert.ok(spare_boolean.value === false, 'value is false');
	spare_boolean.set('$F*2');
	assert.ok(!spare_boolean.is_default);
	await spare_boolean.compute();
	assert.ok(spare_boolean.value === false, 'value is false');
	scene.set_frame(1);
	assert.ok(!spare_boolean.is_default);
	await spare_boolean.compute();
	assert.ok(spare_boolean.value === true, 'value is true');

	spare_boolean.set('$F');
	assert.ok(spare_boolean.is_default);
	assert.equal(spare_boolean.default_value_serialized, '$F');
});
