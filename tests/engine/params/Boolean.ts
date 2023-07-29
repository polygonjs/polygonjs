import type {QUnit} from '../../helpers/QUnit';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {CoreGraphNode} from '../../../src/core/graph/CoreGraphNode';
export function testengineparamsBoolean(qUnit: QUnit) {

qUnit.test('boolean evals correctly when set to different values', async (assert) => {
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
	assert.ok(!boolean_param.hasExpression());

	boolean_param.set('$F%2');
	assert.ok(boolean_param.hasExpression());
	scene.setFrame(1);
	await boolean_param.compute();
	assert.equal(boolean_param.value, true);

	scene.setFrame(2);
	await boolean_param.compute();
	assert.equal(boolean_param.value, false);

	scene.setFrame(3);
	await boolean_param.compute();
	assert.equal(boolean_param.value, true);

	boolean_param.set('true');
	assert.ok(!boolean_param.hasExpression(), '"true" does not create an expression');
	assert.equal(boolean_param.value, true);

	boolean_param.set('false');
	assert.ok(!boolean_param.hasExpression(), '"false" does not create an expression');
	assert.equal(boolean_param.value, false);

	boolean_param.set('1');
	assert.ok(!boolean_param.hasExpression(), '"1" does not create an expression');
	assert.equal(boolean_param.value, true);

	boolean_param.set('0');
	assert.ok(!boolean_param.hasExpression(), '"0" does not create an expression');
	assert.equal(boolean_param.value, false);

	boolean_param.set('-2');
	assert.ok(!boolean_param.hasExpression(), '"-2" does not create an expression');
	assert.equal(boolean_param.value, false);

	boolean_param.set('-2.5');
	assert.ok(!boolean_param.hasExpression(), '"-2.5" does not create an expression');
	assert.equal(boolean_param.value, false);

	boolean_param.set('0+1');
	assert.ok(boolean_param.hasExpression());
	await boolean_param.compute();
	assert.equal(boolean_param.value, true);
});

qUnit.test('boolean isDefault', async (assert) => {
	const geo1 = window.geo1;

	const boolean_param = geo1.p.display;
	assert.ok(boolean_param.isDefault());

	boolean_param.set(0);
	assert.ok(!boolean_param.isDefault());

	boolean_param.set('1*2*0.5');
	boolean_param.compute();
	assert.ok(!boolean_param.isDefault());

	boolean_param.set(1);
	boolean_param.compute();
	assert.ok(boolean_param.isDefault());
});
qUnit.test('boolean is_default for spare with expression', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	scene.timeController.setMaxFrame(10);

	const spare_boolean = geo1.addParam(ParamType.BOOLEAN, 'spare_boolean', '$F', {spare: true})!;
	assert.deepEqual(
		spare_boolean.graphAllPredecessors().map((n: CoreGraphNode) => n.graphNodeId()),
		[scene.timeController.graphNode.graphNodeId()]
	);
	assert.ok(spare_boolean.hasExpression(), 'has expr');
	assert.ok(spare_boolean.isDefault(), 'spare is default');

	scene.setFrame(2);
	await spare_boolean.compute();
	assert.ok(spare_boolean.isDefault(), 'spare is default');
	assert.ok(spare_boolean.value === true, 'value is true');

	scene.setFrame(1);
	await spare_boolean.compute();
	assert.ok(spare_boolean.isDefault(), 'spare is default');
	assert.ok(spare_boolean.value === true, 'value is true');

	scene.setFrame(-1);
	await spare_boolean.compute();
	assert.ok(spare_boolean.isDefault(), 'param is default');
	assert.ok(spare_boolean.value === false, 'value is false');

	scene.setFrame(1);
	await spare_boolean.compute();
	assert.ok(spare_boolean.isDefault(), 'spare is default');
	assert.ok(spare_boolean.value === true, 'value is true');

	scene.setFrame(0);
	await spare_boolean.compute();
	assert.ok(spare_boolean.isDefault(), 'param is default');
	assert.ok(spare_boolean.value === false, 'value is false');

	spare_boolean.set(1);
	assert.ok(!spare_boolean.isDefault());
	assert.ok(spare_boolean.value === true, 'value is true');
	spare_boolean.set(0);
	assert.ok(!spare_boolean.isDefault());
	assert.ok(spare_boolean.value === false, 'value is false');
	spare_boolean.set('$F*2');
	assert.ok(!spare_boolean.isDefault());
	await spare_boolean.compute();
	assert.ok(spare_boolean.value === false, 'value is false');
	scene.setFrame(1);
	assert.ok(!spare_boolean.isDefault());
	await spare_boolean.compute();
	assert.ok(spare_boolean.value === true, 'value is true');

	spare_boolean.set('$F');
	assert.ok(spare_boolean.isDefault());
	assert.equal(spare_boolean.defaultValueSerialized(), '$F');
});

}