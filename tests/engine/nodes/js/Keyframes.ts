import {Box3, Vector3} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {sampleData0} from '../../../../src/core/keyframes/KeyframeSamples';
import {ChannelData, ChannelInterpolation} from '../../../../src/core/keyframes/KeyframeCommon';
import {isArray} from '../../../../src/core/Type';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {OnTickJsNodeOuput} from '../../../../src/engine/nodes/js/OnTick';

// to test:
// - [x] interpolation
// - [x] float
// - [x] vector2
// - [x] vector3
// - [x] vector4
// - [x] in point builder
// - [x] in object builder
// - [x] in actor node
// - [x] multiple channels
// - [x] add safety to make it work with less channels than expected

const box = new Box3();
const size = new Vector3();
QUnit.test('js/keyframes pointbuilder float', async (assert) => {
	const geo1 = window.geo1;
	const line1 = geo1.createNode('line');
	const attribId1 = geo1.createNode('attribId');
	const pointBuilder1 = geo1.createNode('pointBuilder');

	pointBuilder1.setInput(0, attribId1);
	attribId1.setInput(0, line1);
	line1.p.pointsCount.set(100);

	const output1 = pointBuilder1.createNode('output');
	const globals1 = pointBuilder1.createNode('globals');
	const attribute1 = pointBuilder1.createNode('attribute');
	const keyframes1 = pointBuilder1.createNode('keyframes');
	const add1 = pointBuilder1.createNode('add');
	const floatToVec3_1 = pointBuilder1.createNode('floatToVec3');

	output1.setInput('position', add1);
	add1.setInput(0, globals1, 'position');
	floatToVec3_1.setInput(0, keyframes1);
	keyframes1.setInput(0, attribute1);

	attribute1.p.name.set('id');
	attribute1.setJsType(JsConnectionPointType.FLOAT);

	async function getBboxSize() {
		const container = await pointBuilder1.compute();
		const objects = container.coreContent()!.threejsObjectsWithGeo();
		const object = objects[0];
		box.setFromObject(object, true);
		box.getSize(size);
		return size;
	}

	// without add
	assert.equal((await getBboxSize()).x, 0);
	assert.equal((await getBboxSize()).y, 1);
	assert.equal((await getBboxSize()).z, 0);

	// with add
	add1.setInput(1, floatToVec3_1);
	assert.in_delta((await getBboxSize()).x, 1, 0.02);
	assert.in_delta((await getBboxSize()).y, 1, 0.02);
	assert.in_delta((await getBboxSize()).z, 0, 0.02);
});

QUnit.test('js/keyframes pointbuilder vector2', async (assert) => {
	const geo1 = window.geo1;
	const line1 = geo1.createNode('line');
	const attribId1 = geo1.createNode('attribId');
	const pointBuilder1 = geo1.createNode('pointBuilder');

	pointBuilder1.setInput(0, attribId1);
	attribId1.setInput(0, line1);
	line1.p.pointsCount.set(100);

	const output1 = pointBuilder1.createNode('output');
	const globals1 = pointBuilder1.createNode('globals');
	const attribute1 = pointBuilder1.createNode('attribute');
	const keyframes1 = pointBuilder1.createNode('keyframes');
	const add1 = pointBuilder1.createNode('add');
	const vec2ToVec3_1 = pointBuilder1.createNode('vec2ToVec3');

	output1.setInput('position', add1);
	add1.setInput(0, globals1, 'position');
	vec2ToVec3_1.setInput(0, keyframes1);
	keyframes1.setInput(0, attribute1);
	keyframes1.setChannelType(0, JsConnectionPointType.VECTOR2);

	attribute1.p.name.set('id');
	attribute1.setJsType(JsConnectionPointType.FLOAT);

	async function getBboxSize() {
		const container = await pointBuilder1.compute();
		const objects = container.coreContent()!.threejsObjectsWithGeo();
		const object = objects[0];
		box.setFromObject(object, true);
		box.getSize(size);
		return size;
	}

	// without add
	assert.equal((await getBboxSize()).x, 0);
	assert.equal((await getBboxSize()).y, 1);
	assert.equal((await getBboxSize()).z, 0);

	// with add
	add1.setInput(1, vec2ToVec3_1);
	assert.in_delta((await getBboxSize()).x, 1, 0.02);
	assert.in_delta((await getBboxSize()).y, 2, 0.02);
	assert.in_delta((await getBboxSize()).z, 0, 0.02);

	// with correct channel numbers
	keyframes1.setChannelData(0, [sampleData0(), sampleData0()]);
	assert.in_delta((await getBboxSize()).x, 1, 0.02);
	assert.in_delta((await getBboxSize()).y, 2, 0.02);
	assert.in_delta((await getBboxSize()).z, 0, 0.02);

	// with updated channell number
	const channelData = keyframes1.channelData(0)! as ChannelData[];
	assert.ok(channelData, 'channelData ok');
	assert.ok(isArray(channelData));
	channelData[0].keyframes[1].value = 2;
	channelData[1].keyframes[1].value = 8;
	// channelData[2].keyframes[1].value = 14;
	keyframes1.setChannelData(0, channelData);

	assert.in_delta((await getBboxSize()).x, 2, 0.02);
	assert.in_delta((await getBboxSize()).y, 9, 0.02);
	assert.in_delta((await getBboxSize()).z, 0, 0.02);
});

QUnit.test('js/keyframes pointbuilder vector3', async (assert) => {
	const geo1 = window.geo1;
	const line1 = geo1.createNode('line');
	const attribId1 = geo1.createNode('attribId');
	const pointBuilder1 = geo1.createNode('pointBuilder');

	pointBuilder1.setInput(0, attribId1);
	attribId1.setInput(0, line1);
	line1.p.pointsCount.set(100);

	const output1 = pointBuilder1.createNode('output');
	const globals1 = pointBuilder1.createNode('globals');
	const attribute1 = pointBuilder1.createNode('attribute');
	const keyframes1 = pointBuilder1.createNode('keyframes');
	const add1 = pointBuilder1.createNode('add');

	output1.setInput('position', add1);
	add1.setInput(0, globals1, 'position');
	keyframes1.setInput(0, attribute1);
	keyframes1.setChannelType(0, JsConnectionPointType.VECTOR3);

	attribute1.p.name.set('id');
	attribute1.setJsType(JsConnectionPointType.FLOAT);

	async function getBboxSize() {
		const container = await pointBuilder1.compute();
		const objects = container.coreContent()!.threejsObjectsWithGeo();
		const object = objects[0];
		box.setFromObject(object, true);
		box.getSize(size);
		return size;
	}

	// without add
	assert.equal((await getBboxSize()).x, 0);
	assert.equal((await getBboxSize()).y, 1);
	assert.equal((await getBboxSize()).z, 0);

	// with add
	add1.setInput(1, keyframes1);
	assert.in_delta((await getBboxSize()).x, 1, 0.02);
	assert.in_delta((await getBboxSize()).y, 2, 0.02);
	assert.in_delta((await getBboxSize()).z, 1, 0.02);

	// with correct channel numbers
	keyframes1.setChannelData(0, [sampleData0(), sampleData0(), sampleData0()]);
	assert.in_delta((await getBboxSize()).x, 1, 0.02);
	assert.in_delta((await getBboxSize()).y, 2, 0.02);
	assert.in_delta((await getBboxSize()).z, 1, 0.02);

	// with updated channell number
	const channelData = keyframes1.channelData(0)! as ChannelData[];
	assert.ok(channelData, 'channelData ok');
	assert.ok(isArray(channelData));
	channelData[0].keyframes[1].value = 2;
	channelData[1].keyframes[1].value = 8;
	channelData[2].keyframes[1].value = 14;
	keyframes1.setChannelData(0, channelData);

	assert.in_delta((await getBboxSize()).x, 2, 0.02);
	assert.in_delta((await getBboxSize()).y, 9, 0.02);
	assert.in_delta((await getBboxSize()).z, 14, 0.02);
});

QUnit.test('js/keyframes pointbuilder vector4', async (assert) => {
	const geo1 = window.geo1;
	const line1 = geo1.createNode('line');
	const attribId1 = geo1.createNode('attribId');
	const pointBuilder1 = geo1.createNode('pointBuilder');

	pointBuilder1.setInput(0, attribId1);
	attribId1.setInput(0, line1);
	line1.p.pointsCount.set(100);

	const output1 = pointBuilder1.createNode('output');
	const globals1 = pointBuilder1.createNode('globals');
	const attribute1 = pointBuilder1.createNode('attribute');
	const keyframes1 = pointBuilder1.createNode('keyframes');
	const add1 = pointBuilder1.createNode('add');
	const vec4ToVec3_1 = pointBuilder1.createNode('vec4ToVec3');
	const floatToVec3_1 = pointBuilder1.createNode('floatToVec3');

	output1.setInput('position', add1);
	add1.setInput(0, globals1, 'position');
	vec4ToVec3_1.setInput(0, keyframes1);
	floatToVec3_1.setInput(0, vec4ToVec3_1, 'w');
	keyframes1.setInput(0, attribute1);
	keyframes1.setChannelType(0, JsConnectionPointType.VECTOR4);

	attribute1.p.name.set('id');
	attribute1.setJsType(JsConnectionPointType.FLOAT);

	async function getBboxSize() {
		const container = await pointBuilder1.compute();
		const objects = container.coreContent()!.threejsObjectsWithGeo();
		const object = objects[0];
		box.setFromObject(object, true);
		box.getSize(size);
		return size;
	}

	// without add
	assert.equal((await getBboxSize()).x, 0);
	assert.equal((await getBboxSize()).y, 1);
	assert.equal((await getBboxSize()).z, 0);

	// with add
	add1.setInput(1, vec4ToVec3_1);
	add1.setInput(2, floatToVec3_1);
	assert.in_delta((await getBboxSize()).x, 2, 0.02);
	assert.in_delta((await getBboxSize()).y, 2, 0.02);
	assert.in_delta((await getBboxSize()).z, 1, 0.02);

	// with correct channel numbers
	keyframes1.setChannelData(0, [sampleData0(), sampleData0(), sampleData0(), sampleData0()]);
	assert.in_delta((await getBboxSize()).x, 2, 0.02);
	assert.in_delta((await getBboxSize()).y, 2, 0.02);
	assert.in_delta((await getBboxSize()).z, 1, 0.02);

	// with updated channell number
	const channelData = keyframes1.channelData(0)! as ChannelData[];
	assert.ok(channelData, 'channelData ok');
	assert.ok(isArray(channelData));
	channelData[0].keyframes[1].value = 2;
	channelData[1].keyframes[1].value = 8;
	channelData[2].keyframes[1].value = 14;
	channelData[3].keyframes[1].value = 45;
	keyframes1.setChannelData(0, channelData);

	assert.in_delta((await getBboxSize()).x, 47, 0.05);
	assert.in_delta((await getBboxSize()).y, 9, 0.02);
	assert.in_delta((await getBboxSize()).z, 14, 0.02);
});

QUnit.test('js/keyframes objectbuilder float linear', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const objectBuilder1 = geo1.createNode('objectBuilder');

	objectBuilder1.setInput(0, box1);

	const output1 = objectBuilder1.createNode('output');
	const keyframes1 = objectBuilder1.createNode('keyframes');
	const floatToVec3_1 = objectBuilder1.createNode('floatToVec3');

	output1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput(0, keyframes1);

	function setKeyframesTime(t: number) {
		keyframes1.params.get('time')!.set(t);
	}

	async function getBboxPos() {
		const container = await objectBuilder1.compute();
		const objects = container.coreContent()!.threejsObjectsWithGeo();
		const object = objects[0];
		return object.position;
	}

	// time 0
	setKeyframesTime(0);
	assert.equal((await getBboxPos()).x, 0);

	// time 10
	setKeyframesTime(10);
	assert.in_delta((await getBboxPos()).x, 0.05, 0.01);

	// time 40
	setKeyframesTime(40);
	assert.in_delta((await getBboxPos()).x, 0.375, 0.01);

	// set linear
	const channelData = keyframes1.channelData(0)! as ChannelData;
	assert.notOk(isArray(channelData));
	assert.ok(channelData, 'channelData ok');
	channelData.interpolation = ChannelInterpolation.LINEAR;
	keyframes1.setChannelData(0, [channelData]);

	setKeyframesTime(0);
	assert.equal((await getBboxPos()).x, 0);

	// time 10
	setKeyframesTime(10);
	assert.in_delta((await getBboxPos()).x, 0.1, 0.01);

	// time 40
	setKeyframesTime(40);
	assert.in_delta((await getBboxPos()).x, 0.4, 0.01);
});

QUnit.test('js/keyframes objectbuilder multiple channels', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const objectBuilder1 = geo1.createNode('objectBuilder');

	objectBuilder1.setInput(0, box1);

	const output1 = objectBuilder1.createNode('output');
	const keyframes1 = objectBuilder1.createNode('keyframes');
	const add1 = objectBuilder1.createNode('add');

	keyframes1.p.channelsCount.set(3);
	keyframes1.setChannelType(0, JsConnectionPointType.VECTOR3);
	keyframes1.setChannelType(1, JsConnectionPointType.VECTOR3);
	keyframes1.setChannelType(2, JsConnectionPointType.VECTOR3);

	output1.setInput('position', add1);
	add1.setInput(0, keyframes1, 0);
	add1.setInput(1, keyframes1, 1);
	add1.setInput(2, keyframes1, 2);

	function setKeyframesTime(t: number) {
		keyframes1.params.get('time')!.set(t);
	}

	async function getBboxPos() {
		const container = await objectBuilder1.compute();
		const objects = container.coreContent()!.threejsObjectsWithGeo();
		const object = objects[0];
		return object.position;
	}

	// time 0
	setKeyframesTime(100);
	assert.equal((await getBboxPos()).x, 3);
	assert.equal((await getBboxPos()).y, 3);
	assert.equal((await getBboxPos()).z, 3);

	function setChannelKey(channelIndex: number, keyValue: number) {
		const channelData = keyframes1.channelData(channelIndex)! as ChannelData[];
		assert.ok(channelData, 'channelData ok');
		assert.ok(isArray(channelData));
		channelData[0].keyframes[1].value = keyValue;
		channelData[1].keyframes[1].value = keyValue * 2;
		channelData[2].keyframes[1].value = keyValue * 4;
		keyframes1.setChannelData(channelIndex, channelData);
	}
	setChannelKey(0, 3);
	setChannelKey(1, 30);
	setChannelKey(2, 300);

	assert.equal((await getBboxPos()).x, 333);
	assert.equal((await getBboxPos()).y, 666);
	assert.equal((await getBboxPos()).z, 1332);
});

QUnit.test('js/keyframes with actor', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onTick1 = actor1.createNode('onTick');
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectScale1 = actor1.createNode('setObjectScale');
	const keyframes1 = actor1.createNode('keyframes');
	const multAdd1 = actor1.createNode('multAdd');

	keyframes1.setChannelType(0, JsConnectionPointType.VECTOR3);

	setObjectScale1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectScale1.setInput(setObjectScale1.p.scale.name(), keyframes1);
	keyframes1.setInput(0, multAdd1);
	multAdd1.setInput(0, onTick1, OnTickJsNodeOuput.TIME);

	multAdd1.params.get('mult')!.set(100);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.scale.y, 1);
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(150);
		assert.in_delta(object.scale.y, 1, 0.01, 'object scale 1');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(150);
		assert.in_delta(object.scale.y, 0.1, 0.1, 'object scale up');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(150);
		assert.in_delta(object.scale.y, 0.3, 0.1, 'object scale up');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(150);
		assert.in_delta(object.scale.y, 0.5, 0.1, 'object scale up');
	});
});
