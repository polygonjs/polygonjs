import {ColorParam} from './../../../../src/engine/params/Color';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType, ParamConvertibleJsType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {ParamInitValuesTypeMap} from '../../../../src/engine/params/types/ParamInitValuesTypeMap';
import {SetParamJsNodeInputName} from '../../../../src/engine/nodes/js/SetParam';
import {ParamConstructorMap} from '../../../../src/engine/params/types/ParamConstructorMap';
import {CoreType} from '../../../../src/core/Type';
import {Number3} from '../../../../src/types/GlobalTypes';

interface Options<T extends ParamType> {
	assert: Assert;
	paramType: T;
	jsType: ParamConvertibleJsType;
	param: ParamConstructorMap[T];
	initValue: ParamInitValuesTypeMap[T];
	targetValue: ParamInitValuesTypeMap[T];
	expectedValue: ParamInitValuesTypeMap[T];
	lerp: number;
}

async function setParamAndCheck<T extends ParamType>(options: Options<T>) {
	const {assert, jsType, param, initValue, targetValue, expectedValue, lerp} = options;

	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setParam1 = actor1.createNode('setParam');

	setParam1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setParam1.p.param.setParam(param);
	setParam1.setParamType(jsType);
	(setParam1.params.get(SetParamJsNodeInputName.val)! as ParamConstructorMap[T]).set(targetValue as never);
	setParam1.params.get('lerp')!.set(lerp);

	await actor1.compute();

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		// check start value
		if (CoreType.isNumber(initValue)) {
			assert.equal(param.value, initValue, 'ok init number');
		}
		if (param instanceof ColorParam) {
			assert.deepEqual(param.value.toArray(), initValue as Number3, 'ok init color');
		}
		if (CoreType.isString(initValue)) {
			assert.equal(param.value, initValue, 'ok init string');
		}
		if (CoreType.isVector(param.value)) {
			assert.deepEqual(param.value.toArray(), initValue as Number3, 'ok init vector');
		}
		scene.play();
		assert.equal(scene.time(), 0);
		// check param is still on start value
		if (CoreType.isNumber(initValue)) {
			assert.equal(param.value, initValue, 'ok unchanged number');
		}
		if (param instanceof ColorParam) {
			assert.deepEqual(param.value.toArray(), initValue as Number3, 'ok unchanged color');
		}
		if (CoreType.isString(initValue)) {
			assert.equal(param.value, initValue, 'ok unchanged string');
		}
		if (CoreType.isVector(param.value)) {
			assert.deepEqual(param.value.toArray(), initValue as Number3, 'ok unchanged vector');
		}

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		// check param value has changed
		if (CoreType.isNumber(expectedValue)) {
			assert.equal(param.value, expectedValue, 'ok updated number');
		}
		if (param instanceof ColorParam) {
			assert.deepEqual(param.value.toArray(), expectedValue as Number3, 'ok updated color');
		}
		if (CoreType.isString(expectedValue)) {
			assert.equal(param.value, expectedValue, 'ok updated string');
		}
		if (CoreType.isVector(param.value)) {
			assert.deepEqual(param.value.toArray(), expectedValue as Number3, 'ok updated vector');
		}
	});
}

QUnit.test('js/setParam boolean lerp 1', async (assert) => {
	const geo1 = window.geo1;
	const tube1 = geo1.createNode('tube');
	await setParamAndCheck({
		assert,
		paramType: ParamType.BOOLEAN,
		jsType: JsConnectionPointType.BOOLEAN,
		param: tube1.p.cap,
		initValue: false,
		targetValue: true,
		expectedValue: true,
		lerp: 1,
	});
});

QUnit.test('js/setParam boolean lerp 0.5', async (assert) => {
	const geo1 = window.geo1;
	const tube1 = geo1.createNode('tube');
	await setParamAndCheck({
		assert,
		paramType: ParamType.BOOLEAN,
		jsType: JsConnectionPointType.BOOLEAN,
		param: tube1.p.cap,
		initValue: false,
		targetValue: true,
		expectedValue: true,
		lerp: 0.5,
	});
});
QUnit.test('js/setParam color lerp 1', async (assert) => {
	const geo1 = window.geo1;
	const color1 = geo1.createNode('color');
	await setParamAndCheck({
		assert,
		paramType: ParamType.COLOR,
		jsType: JsConnectionPointType.COLOR,
		param: color1.p.color,
		initValue: [1, 1, 1],
		targetValue: [4, 2, 3],
		expectedValue: [4, 2, 3],
		lerp: 1,
	});
});
QUnit.test('js/setParam color lerp 0.5', async (assert) => {
	const geo1 = window.geo1;
	const color1 = geo1.createNode('color');
	await setParamAndCheck({
		assert,
		paramType: ParamType.COLOR,
		jsType: JsConnectionPointType.COLOR,
		param: color1.p.color,
		initValue: [1, 1, 1],
		targetValue: [4, 2, 3],
		expectedValue: [2.5, 1.5, 2],
		lerp: 0.5,
	});
});

QUnit.test('js/setParam float lerp 1', async (assert) => {
	await setParamAndCheck({
		assert,
		paramType: ParamType.FLOAT,
		jsType: JsConnectionPointType.FLOAT,
		param: window.geo1.p.scale,
		initValue: 1,
		targetValue: 2,
		expectedValue: 2,
		lerp: 1,
	});
});
QUnit.test('js/setParam float lerp 0.5', async (assert) => {
	await setParamAndCheck({
		assert,
		paramType: ParamType.FLOAT,
		jsType: JsConnectionPointType.FLOAT,
		param: window.geo1.p.scale,
		initValue: 1,
		targetValue: 2,
		expectedValue: 1.5,
		lerp: 0.5,
	});
});
QUnit.test('js/setParam integer lerp 1', async (assert) => {
	const geo1 = window.geo1;
	const switch1 = geo1.createNode('switch');
	await setParamAndCheck({
		assert,
		paramType: ParamType.INTEGER,
		jsType: JsConnectionPointType.INT,
		param: switch1.p.input,
		initValue: 0,
		targetValue: 3,
		expectedValue: 3,
		lerp: 1,
	});
});
QUnit.test('js/setParam integer lerp 0.5', async (assert) => {
	const geo1 = window.geo1;
	const switch1 = geo1.createNode('switch');
	await setParamAndCheck({
		assert,
		paramType: ParamType.INTEGER,
		jsType: JsConnectionPointType.INT,
		param: switch1.p.input,
		initValue: 0,
		targetValue: 3,
		expectedValue: 2,
		lerp: 0.5,
	});
});

QUnit.test('js/setParam string lerp 1', async (assert) => {
	const geo1 = window.geo1;
	const attribCreate1 = geo1.createNode('attribCreate');
	await setParamAndCheck({
		assert,
		paramType: ParamType.STRING,
		jsType: JsConnectionPointType.STRING,
		param: attribCreate1.p.name,
		initValue: 'newAttrib',
		targetValue: 'test',
		expectedValue: 'test',
		lerp: 1,
	});
});
QUnit.test('js/setParam vector2 lerp 1', async (assert) => {
	const geo1 = window.geo1;
	const attribCreate1 = geo1.createNode('attribCreate');
	await setParamAndCheck({
		assert,
		paramType: ParamType.VECTOR2,
		jsType: JsConnectionPointType.VECTOR2,
		param: attribCreate1.p.value2,
		initValue: [0, 0],
		targetValue: [1, 2],
		expectedValue: [1, 2],
		lerp: 1,
	});
});
QUnit.test('js/setParam vector2 lerp 0.5', async (assert) => {
	const geo1 = window.geo1;
	const attribCreate1 = geo1.createNode('attribCreate');
	await setParamAndCheck({
		assert,
		paramType: ParamType.VECTOR2,
		jsType: JsConnectionPointType.VECTOR2,
		param: attribCreate1.p.value2,
		initValue: [0, 0],
		targetValue: [1, 2],
		expectedValue: [0.5, 1],
		lerp: 0.5,
	});
});
QUnit.test('js/setParam vector3 lerp 1', async (assert) => {
	const geo1 = window.geo1;
	const attribCreate1 = geo1.createNode('attribCreate');
	await setParamAndCheck({
		assert,
		paramType: ParamType.VECTOR3,
		jsType: JsConnectionPointType.VECTOR3,
		param: attribCreate1.p.value3,
		initValue: [0, 0, 0],
		targetValue: [1, 2, 3],
		expectedValue: [1, 2, 3],
		lerp: 1,
	});
});
QUnit.test('js/setParam vector3 lerp 0.5', async (assert) => {
	const geo1 = window.geo1;
	const attribCreate1 = geo1.createNode('attribCreate');
	await setParamAndCheck({
		assert,
		paramType: ParamType.VECTOR3,
		jsType: JsConnectionPointType.VECTOR3,
		param: attribCreate1.p.value3,
		initValue: [0, 0, 0],
		targetValue: [1, 2, 3],
		expectedValue: [0.5, 1, 1.5],
		lerp: 0.5,
	});
});
QUnit.test('js/setParam vector4 lerp 1', async (assert) => {
	const geo1 = window.geo1;
	const attribCreate1 = geo1.createNode('attribCreate');
	await setParamAndCheck({
		assert,
		paramType: ParamType.VECTOR4,
		jsType: JsConnectionPointType.VECTOR4,
		param: attribCreate1.p.value4,
		initValue: [0, 0, 0, 0],
		targetValue: [1, 2, 3, 4],
		expectedValue: [1, 2, 3, 4],
		lerp: 1,
	});
});
QUnit.test('js/setParam vector4 lerp 0.5', async (assert) => {
	const geo1 = window.geo1;
	const attribCreate1 = geo1.createNode('attribCreate');
	await setParamAndCheck({
		assert,
		paramType: ParamType.VECTOR4,
		jsType: JsConnectionPointType.VECTOR4,
		param: attribCreate1.p.value4,
		initValue: [0, 0, 0, 0],
		targetValue: [1, 2, 3, 4],
		expectedValue: [0.5, 1, 1.5, 2],
		lerp: 0.5,
	});
});
