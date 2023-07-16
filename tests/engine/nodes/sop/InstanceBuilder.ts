import {
	Box3,
	BufferAttribute,
	// BufferAttribute,
	Vector3,
} from 'three';
import {InstanceBuilderSopNode} from '../../../../src/engine/nodes/sop/InstanceBuilder';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {FloatParam} from '../../../../src/engine/params/Float';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
// import {AttributeJsNodeOutput} from '../../../../src/engine/nodes/js/Attribute';
import {createRequiredNodes} from './Instance';
import {CoreGeometry} from '../../../../src/core/geometry/Geometry';
import {AttributeJsNodeOutput} from '../../../../src/engine/nodes/js/Attribute';

const _v3 = new Vector3();
const bbox = new Box3();
const size = new Vector3();
async function _getBbox(node: InstanceBuilderSopNode) {
	const container = await node.compute();
	const objects = container.coreContent()!.threejsObjectsWithGeo();
	const object = objects[0];
	const geometry = object.geometry;
	const instancePosition = geometry.getAttribute('instancePosition');
	// container.boundingBox(bbox);

	bbox.makeEmpty();
	const pointsCount = CoreGeometry.pointsCount(geometry);
	for (let i = 0; i < pointsCount; i++) {
		_v3.fromBufferAttribute(instancePosition, i);
		bbox.expandByPoint(_v3);
	}
	// bbox.getSize(size);

	return {instancePosition, min: bbox.min, max: bbox.max, size};
}

QUnit.test('sop/instanceBuilder simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const line1 = geo1.createNode('line');
	const box1 = geo1.createNode('box');
	const instance1 = geo1.createNode('instance');
	const instanceBuilder1 = geo1.createNode('instanceBuilder');
	createRequiredNodes(instance1);
	instance1.setInput(0, box1);
	instance1.setInput(1, line1);
	instanceBuilder1.setInput(0, instance1);

	line1.p.direction.set([0, 0, 1]);
	line1.p.pointsCount.set(100);
	line1.p.length.set(10);

	//
	const output1 = instanceBuilder1.createNode('output');
	const add1 = instanceBuilder1.createNode('add');
	const globals1 = instanceBuilder1.createNode('globals');
	const vec3ToFloat_1 = instanceBuilder1.createNode('vec3ToFloat');
	const sin1 = instanceBuilder1.createNode('sin');
	const floatToVec3_1 = instanceBuilder1.createNode('floatToVec3');
	const param1 = instanceBuilder1.createNode('param');
	output1.setInput('instancePosition', add1);
	vec3ToFloat_1.setInput(0, globals1, 'instancePosition');
	sin1.setInput(0, vec3ToFloat_1, 'z');
	floatToVec3_1.setInput('y', sin1);
	add1.setInput(0, globals1, 'instancePosition');
	param1.setJsType(JsConnectionPointType.FLOAT);
	param1.p.name.set('offset');
	floatToVec3_1.setInput('x', param1);

	async function getMinY() {
		return (await _getBbox(instanceBuilder1)).min.y;
	}
	async function getMaxY() {
		return (await _getBbox(instanceBuilder1)).max.y;
	}
	async function getX() {
		return (await _getBbox(instanceBuilder1)).min.x;
	}

	// no addition
	assert.in_delta(await getMinY(), 0, 0.02);
	assert.in_delta(await getMaxY(), 0, 0.02);
	assert.equal(await getX(), 0);

	// with addition
	add1.setInput(1, floatToVec3_1);
	assert.in_delta(await getMinY(), -1, 0.02);
	assert.in_delta(await getMaxY(), 1, 0.02);

	// with x
	const offset = instanceBuilder1.params.get('offset') as FloatParam;
	assert.ok(offset);
	assert.equal(offset.type(), ParamType.FLOAT);
	offset.set(1);
	assert.equal(await getX(), 1);

	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(instanceBuilder1.usedAssembler(), async () => {
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const instanceBuilder2 = scene2.node(instanceBuilder1.path()) as InstanceBuilderSopNode;
		async function getMinY2() {
			return (await _getBbox(instanceBuilder2)).min.y;
		}
		async function getMaxY2() {
			return (await _getBbox(instanceBuilder2)).max.y;
		}
		async function getX2() {
			return (await _getBbox(instanceBuilder2)).min.x;
		}

		const offset2 = instanceBuilder2.params.get('offset')! as FloatParam;
		assert.ok(offset2);
		assert.equal(offset2.type(), ParamType.FLOAT);
		assert.equal(offset2.value, 1);

		assert.in_delta(await getMinY2(), -1, 0.02);
		assert.in_delta(await getMaxY2(), 1, 0.02);
		assert.equal(await getX2(), 1);

		offset2.set(2);
		assert.equal(await getX2(), 2);
	});
});

QUnit.test('sop/instanceBuilder read attributes', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const box1 = geo1.createNode('box');
	const instance1 = geo1.createNode('instance');
	const instanceBuilder1 = geo1.createNode('instanceBuilder');

	createRequiredNodes(instance1);
	instance1.setInput(0, box1);
	instance1.setInput(1, plane1);
	instanceBuilder1.setInput(0, instance1);

	const globals = instanceBuilder1.createNode('globals');
	const output = instanceBuilder1.createNode('output');
	const add1 = instanceBuilder1.createNode('add');
	const attribute1 = instanceBuilder1.createNode('attribute');
	const colorToVec3_1 = instanceBuilder1.createNode('colorToVec3');

	output.setInput('instancePosition', add1);
	add1.setInput(0, globals, 'instancePosition');
	add1.setInput(1, colorToVec3_1);
	colorToVec3_1.setInput(0, attribute1, AttributeJsNodeOutput.VAL);

	attribute1.setJsType(JsConnectionPointType.COLOR);
	attribute1.p.name.set('color');

	await instanceBuilder1.compute();
	assert.ok(instanceBuilder1.states.error.active());
	assert.equal(instanceBuilder1.states.error.message(), 'attribute color is missing');

	const color1 = geo1.createNode('color');
	color1.setInput(0, instance1);
	instanceBuilder1.setInput(0, color1);

	const container = await instanceBuilder1.compute();
	assert.notOk(instanceBuilder1.states.error.active());
	assert.equal(instanceBuilder1.states.error.message(), null);

	const geometry = container.coreContent()!.threejsObjectsWithGeo()[0].geometry;
	const newPos = (geometry.getAttribute('instancePosition') as BufferAttribute).array;
	const expectedMatch = [0.5, 1, 0.5, 1.5, 1, 0.5, 0.5, 1, 1.5, 1.5, 1, 1.5];
	for (let i = 0; i < newPos.length; i++) {
		assert.in_delta(newPos[i], expectedMatch[i], 0.001, `${i}`);
	}
});

QUnit.test('sop/instanceBuilder write attributes', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const plane1 = geo1.createNode('plane');
	const instance1 = geo1.createNode('instance');
	const instanceBuilder1 = geo1.createNode('instanceBuilder');

	createRequiredNodes(instance1);
	instance1.setInput(0, box1);
	instance1.setInput(1, plane1);
	instanceBuilder1.setInput(0, instance1);

	const globals = instanceBuilder1.createNode('globals');
	const output = instanceBuilder1.createNode('output');
	const attribute1 = instanceBuilder1.createNode('attribute');
	const vec3ToColor_1 = instanceBuilder1.createNode('vec3ToColor');

	output.setInput('instancePosition', globals, 'instancePosition');
	vec3ToColor_1.setInput(0, globals, 'instancePosition');
	attribute1.setInput(0, vec3ToColor_1);

	attribute1.setJsType(JsConnectionPointType.COLOR);
	attribute1.p.name.set('color');
	attribute1.p.exportWhenConnected.set(true);

	const container = await instanceBuilder1.compute();
	assert.notOk(instanceBuilder1.states.error.active());
	assert.equal(instanceBuilder1.states.error.message(), null);

	const geometry = container.coreContent()!.threejsObjectsWithGeo()[0].geometry;
	const color = (geometry.getAttribute('color') as BufferAttribute).array;
	const expectedMatch = [-0.5, 0, -0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5];
	for (let i = 0; i < color.length; i++) {
		assert.in_delta(color[i], expectedMatch[i], 0.001, `${i}`);
	}
});
