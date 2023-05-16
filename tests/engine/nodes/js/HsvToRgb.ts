import {RectAreaLight} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {FloatParam} from '../../../../src/engine/params/Float';

QUnit.test('js/hsvToRgb', async (assert) => {
	const geo1 = window.geo1;
	const areaLight1 = geo1.createNode('areaLight');
	const copy1 = geo1.createNode('copy');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, copy1);
	copy1.setInput(0, areaLight1);
	copy1.p.count.set(5);
	areaLight1.p.showHelper.set(false);

	const globals1 = objectBuilder1.createNode('globals');
	const outputAreaLight1 = objectBuilder1.createNode('outputAreaLight');
	const param1 = objectBuilder1.createNode('param');
	const hsvToRgb1 = objectBuilder1.createNode('hsvToRgb');
	const intToFloat1 = objectBuilder1.createNode('intToFloat');
	const multAdd1 = objectBuilder1.createNode('multAdd');
	const divide1 = objectBuilder1.createNode('divide');
	const floatToVec3_1 = objectBuilder1.createNode('floatToVec3');

	outputAreaLight1.setInput('color', hsvToRgb1);
	hsvToRgb1.setInput(0, floatToVec3_1);
	floatToVec3_1.setInput(0, divide1);
	divide1.setInput(0, intToFloat1);
	divide1.setInput(1, multAdd1);
	intToFloat1.setInput(0, globals1, 'objnum');
	multAdd1.setInput(0, param1);

	floatToVec3_1.p.y.set(1);
	floatToVec3_1.p.z.set(1);
	multAdd1.params.get('preAdd')!.set(0.1);
	param1.p.name.set('objectsCount');
	param1.setJsType(JsConnectionPointType.FLOAT);

	await objectBuilder1.compute();
	const objectsCountParam = objectBuilder1.params.get('objectsCount')! as FloatParam;
	assert.ok(objectsCountParam, 'ok param');
	objectsCountParam.set('objectsCount(0)');

	const container = await objectBuilder1.compute();
	const objects = container.coreContent()!.threejsObjects() as RectAreaLight[];
	assert.equal(objects.length, 5);
	assert.in_delta(objects[0].color.r, 1, 0.01);
	assert.in_delta(objects[1].color.r, 0.8235, 0.01);
	assert.in_delta(objects[2].color.r, 0, 0.01);
	assert.in_delta(objects[3].color.r, 0, 0.01);
	assert.in_delta(objects[4].color.r, 0.7058, 0.01);
	assert.in_delta(objects[0].color.g, 0, 0.01);
	assert.in_delta(objects[1].color.g, 1, 0.01);
	assert.in_delta(objects[2].color.g, 1, 0.01);
	assert.in_delta(objects[3].color.g, 0.47, 0.01);
	assert.in_delta(objects[4].color.g, 0, 0.01);
	assert.in_delta(objects[0].color.b, 0, 0.01);
	assert.in_delta(objects[1].color.b, 0, 0.01);
	assert.in_delta(objects[2].color.b, 0.3529, 0.01);
	assert.in_delta(objects[3].color.b, 1, 0.01);
	assert.in_delta(objects[4].color.b, 1, 0.01);
});
