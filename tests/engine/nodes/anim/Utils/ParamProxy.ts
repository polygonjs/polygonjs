import type {QUnit} from '../../../../helpers/QUnit';
import {AnimTargetNodeTargetType} from '../../../../../src/engine/nodes/anim/Target';
import {AnimPropertyValueNodeMode} from '../../../../../src/engine/nodes/anim/PropertyValue';
import {CoreSleep} from '../../../../../src/core/Sleep';
import {BaseParamType} from '../../../../../src/engine/params/_Base';
import {AnimationPositionMode, AnimationPositionRelativeTo} from '../../../../../src/core/animation/Position';
import {ParamType} from '../../../../../src/engine/poly/ParamType';
import {Number4} from '../../../../../src/types/GlobalTypes';
export function testenginenodesanimUtilsParamProxy(qUnit: QUnit) {

interface Values {
	step1: Number4;
	step2: Number4;
}

function createAnimNode(param: BaseParamType, values: Values) {
	const ANIM = window.scene.root().createNode('animationsNetwork');

	const duration = ANIM.createNode('duration');
	duration.p.duration.set(0.5);

	const target = ANIM.createNode('target');
	target.setTargetType(AnimTargetNodeTargetType.NODE);
	target.p.nodePath.set(param.node.path());
	target.p.updateMatrix.set(true);
	target.setInput(0, duration);

	const propertyName = ANIM.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set(param.name());

	const propertyValue1 = ANIM.createNode('propertyValue');
	propertyValue1.setInput(0, propertyName);
	propertyValue1.setMode(AnimPropertyValueNodeMode.CUSTOM);
	const propertyValue2 = ANIM.createNode('propertyValue');
	propertyValue2.setInput(0, propertyName);
	propertyValue2.setMode(AnimPropertyValueNodeMode.CUSTOM);

	const valueSize = (param.isMultiple() ? param.components?.length : 1) || 1;
	propertyValue1.p.size.set(valueSize);
	propertyValue2.p.size.set(valueSize);
	switch (valueSize) {
		case 1: {
			propertyValue1.p.value1.set(values.step1[0]);
			propertyValue2.p.value1.set(values.step2[0]);
			break;
		}
		case 2: {
			propertyValue1.p.value2.set([values.step1[0], values.step1[1]]);
			propertyValue2.p.value2.set([values.step2[0], values.step2[1]]);
			break;
		}
		case 3: {
			propertyValue1.p.value3.set([values.step1[0], values.step1[1], values.step1[2]]);
			propertyValue2.p.value3.set([values.step2[0], values.step2[1], values.step2[2]]);
			break;
		}
		case 4: {
			propertyValue1.p.value4.set(values.step1);
			propertyValue2.p.value4.set(values.step2);
			break;
		}
	}

	const position1 = ANIM.createNode('position');
	position1.setInput(0, propertyValue2);
	position1.setMode(AnimationPositionMode.RELATIVE);
	position1.setRelativeTo(AnimationPositionRelativeTo.END);
	position1.p.offset.set(0.1);
	const merge1 = ANIM.createNode('merge');
	merge1.setInput(0, propertyValue1);
	merge1.setInput(1, position1);

	const null1 = ANIM.createNode('null');
	null1.setInput(0, merge1);

	return {null1, propertyValue1, propertyValue2};
}

qUnit.test('integer param can be animated twice without value being reset', async (assert) => {
	await window.scene.waitForCooksCompleted();

	const geo1 = window.geo1;
	const param = geo1.p.renderOrder;
	assert.equal(param.type(), ParamType.INTEGER);
	param.set(0);
	const {null1} = createAnimNode(param, {step1: [5, 0, 0, 0], step2: [10, 0, 0, 0]});

	assert.deepEqual(param.valueSerialized(), 0);
	null1.p.play.pressButton();
	await CoreSleep.sleep(500);
	assert.in_delta(param.valueSerialized(), 5, 0.2);
	await CoreSleep.sleep(100);
	assert.in_delta(param.valueSerialized(), 5, 0.2);
	await CoreSleep.sleep(700);
	assert.deepEqual(param.valueSerialized(), 10);
});

qUnit.test('float param can be animated twice without value being reset', async (assert) => {
	await window.scene.waitForCooksCompleted();

	const geo1 = window.geo1;
	const param = geo1.p.scale;
	assert.equal(param.type(), ParamType.FLOAT);
	param.set(0);
	const {null1} = createAnimNode(param, {step1: [1, 0, 0, 0], step2: [2, 0, 0, 0]});

	assert.deepEqual(param.valueSerialized(), 0);
	null1.p.play.pressButton();
	await CoreSleep.sleep(500);
	assert.in_delta(param.valueSerialized(), 1, 0.2);
	await CoreSleep.sleep(100);
	assert.in_delta(param.valueSerialized(), 1, 0.2);
	await CoreSleep.sleep(700);
	assert.deepEqual(param.valueSerialized(), 2);
});
qUnit.test('vector2 param can be animated twice without value being reset', async (assert) => {
	await window.scene.waitForCooksCompleted();

	const geo1 = window.geo1;
	const sphere1 = geo1.createNode('sphere');
	const param = sphere1.p.resolution;
	assert.equal(param.type(), ParamType.VECTOR2);
	param.set([2, 2]);
	const {null1} = createAnimNode(param, {step1: [10, 10, 0, 0], step2: [20, 20, 0, 0]});

	assert.deepEqual(param.valueSerialized(), [2, 2]);
	null1.p.play.pressButton();
	await CoreSleep.sleep(500);
	assert.in_delta(param.valueSerialized()[0], 10, 1);
	assert.in_delta(param.valueSerialized()[1], 10, 1);
	await CoreSleep.sleep(100);
	assert.in_delta(param.valueSerialized()[0], 10, 1);
	assert.in_delta(param.valueSerialized()[1], 10, 1);
	await CoreSleep.sleep(700);
	assert.in_delta(param.valueSerialized()[0], 20, 1);
	assert.in_delta(param.valueSerialized()[1], 20, 1);
});
qUnit.test('vector3 param can be animated twice without value being reset', async (assert) => {
	await window.scene.waitForCooksCompleted();

	const geo1 = window.geo1;
	const param = geo1.p.t;
	assert.equal(param.type(), ParamType.VECTOR3);
	param.set([0, 0, 0]);
	const {null1} = createAnimNode(param, {step1: [0, 1, 0, 0], step2: [0, 2, 0, 0]});

	assert.deepEqual(param.valueSerialized(), [0, 0, 0]);
	null1.p.play.pressButton();
	await CoreSleep.sleep(500);
	assert.in_delta(param.valueSerialized()[1], 1, 0.1);
	await CoreSleep.sleep(100);
	assert.in_delta(param.valueSerialized()[1], 1, 0.1);
	await CoreSleep.sleep(700);
	assert.in_delta(param.valueSerialized()[1], 2, 0.1);
});
qUnit.test('color param can be animated twice without value being reset', async (assert) => {
	await window.scene.waitForCooksCompleted();

	const geo1 = window.geo1;
	const color1 = geo1.createNode('color');
	const param = color1.p.color;
	assert.equal(param.type(), ParamType.COLOR);
	param.set([0, 0, 0]);
	const {null1} = createAnimNode(param, {step1: [0, 0.5, 0, 0], step2: [0, 1, 0, 0]});

	assert.deepEqual(param.valueSerialized(), [0, 0, 0]);
	null1.p.play.pressButton();
	await CoreSleep.sleep(500);
	assert.in_delta(param.valueSerialized()[1], 0.5, 0.1);
	await CoreSleep.sleep(100);
	assert.in_delta(param.valueSerialized()[1], 0.5, 0.1);
	await CoreSleep.sleep(700);
	assert.in_delta(param.valueSerialized()[1], 1, 0.1);
});

qUnit.test('color param can be animated twice without value being reset with value set as color', async (assert) => {
	await window.scene.waitForCooksCompleted();

	const geo1 = window.geo1;
	const color1 = geo1.createNode('color');
	const param = color1.p.color;
	assert.equal(param.type(), ParamType.COLOR);
	param.set([0, 0, 0]);
	const values: Values = {step1: [0, 0.5, 0, 0], step2: [0, 1, 0, 0]};
	const {null1, propertyValue1, propertyValue2} = createAnimNode(param, values);
	propertyValue1.p.asColor.set(1);
	propertyValue2.p.asColor.set(1);
	propertyValue1.p.color.set([values.step1[0], values.step1[1], values.step1[2]]);
	propertyValue2.p.color.set([values.step2[0], values.step2[1], values.step2[2]]);

	assert.deepEqual(param.valueSerialized(), [0, 0, 0]);
	null1.p.play.pressButton();
	await CoreSleep.sleep(500);
	assert.in_delta(param.valueSerialized()[1], 0.5, 0.1);
	await CoreSleep.sleep(100);
	assert.in_delta(param.valueSerialized()[1], 0.5, 0.1);
	await CoreSleep.sleep(700);
	assert.in_delta(param.valueSerialized()[1], 1, 0.1);
});

qUnit.test('vector4 param can be animated twice without value being reset', async (assert) => {
	await window.scene.waitForCooksCompleted();

	const geo1 = window.geo1;
	const attribCreate1 = geo1.createNode('attribCreate');
	const param = attribCreate1.p.value4;
	assert.equal(param.type(), ParamType.VECTOR4);
	param.set([0, 0, 0, 0]);
	const {null1} = createAnimNode(param, {step1: [0, 1, 0, 0], step2: [0, 2, 0, 0]});

	assert.deepEqual(param.valueSerialized(), [0, 0, 0, 0]);
	null1.p.play.pressButton();
	await CoreSleep.sleep(500);
	assert.in_delta(param.valueSerialized()[1], 1, 0.1);
	await CoreSleep.sleep(100);
	assert.in_delta(param.valueSerialized()[1], 1, 0.1);
	await CoreSleep.sleep(700);
	assert.in_delta(param.valueSerialized()[1], 2, 0.1);
});

}