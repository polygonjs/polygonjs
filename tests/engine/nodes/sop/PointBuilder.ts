import type {QUnit} from '../../../helpers/QUnit';
import {Box3, BufferAttribute, Vector3} from 'three';
import {PointBuilderSopNode} from '../../../../src/engine/nodes/sop/PointBuilder';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {FloatParam} from '../../../../src/engine/params/Float';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {AttributeJsNodeOutput} from '../../../../src/engine/nodes/js/Attribute';
export function testenginenodessopPointBuilder(qUnit: QUnit) {

const bbox = new Box3();
const size = new Vector3();
async function _getBbox(node: PointBuilderSopNode) {
	const container = await node.compute();
	container.boundingBox(bbox);
	bbox.getSize(size);
	return {min: bbox.min, max: bbox.max, size};
}

qUnit.test('sop/pointBuilder simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const line1 = geo1.createNode('line');
	const pointBuilder1 = geo1.createNode('pointBuilder');
	pointBuilder1.setInput(0, line1);

	line1.p.direction.set([0, 0, 1]);
	line1.p.pointsCount.set(100);
	line1.p.length.set(10);

	//
	const output1 = pointBuilder1.createNode('output');
	const add1 = pointBuilder1.createNode('add');
	const globals1 = pointBuilder1.createNode('globals');
	const vec3ToFloat_1 = pointBuilder1.createNode('vec3ToFloat');
	const sin1 = pointBuilder1.createNode('sin');
	const floatToVec3_1 = pointBuilder1.createNode('floatToVec3');
	const param1 = pointBuilder1.createNode('param');
	output1.setInput('position', add1);
	vec3ToFloat_1.setInput(0, globals1, 'position');
	sin1.setInput(0, vec3ToFloat_1, 'z');
	floatToVec3_1.setInput('y', sin1);
	add1.setInput(0, globals1, 'position');
	param1.setJsType(JsConnectionPointType.FLOAT);
	param1.p.name.set('offset');
	floatToVec3_1.setInput('x', param1);

	async function getMinY() {
		return (await _getBbox(pointBuilder1)).min.y;
	}
	async function getMaxY() {
		return (await _getBbox(pointBuilder1)).max.y;
	}
	async function getX() {
		return (await _getBbox(pointBuilder1)).min.x;
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
	const offset = pointBuilder1.params.get('offset') as FloatParam;
	assert.ok(offset);
	assert.equal(offset.type(), ParamType.FLOAT);
	offset.set(1);
	assert.equal(await getX(), 1);

	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(pointBuilder1.usedAssembler(), async () => {
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const pointBuilder2 = scene2.node(pointBuilder1.path()) as PointBuilderSopNode;
		async function getMinY2() {
			return (await _getBbox(pointBuilder2)).min.y;
		}
		async function getMaxY2() {
			return (await _getBbox(pointBuilder2)).max.y;
		}
		async function getX2() {
			return (await _getBbox(pointBuilder2)).min.x;
		}

		const offset2 = pointBuilder2.params.get('offset')! as FloatParam;
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

qUnit.test('sop/pointBuilder read attributes', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const pointBuilder1 = geo1.createNode('pointBuilder');

	pointBuilder1.setInput(0, plane1);

	const globals = pointBuilder1.createNode('globals');
	const output = pointBuilder1.createNode('output');
	const add1 = pointBuilder1.createNode('add');
	const attribute1 = pointBuilder1.createNode('attribute');
	const colorToVec3_1 = pointBuilder1.createNode('colorToVec3');

	output.setInput('position', add1);
	add1.setInput(0, globals, 'position');
	add1.setInput(1, colorToVec3_1);
	colorToVec3_1.setInput(0, attribute1, AttributeJsNodeOutput.VAL);

	attribute1.setJsType(JsConnectionPointType.COLOR);
	attribute1.p.name.set('color');

	await pointBuilder1.compute();
	assert.ok(pointBuilder1.states.error.active());
	assert.equal(pointBuilder1.states.error.message(), 'attribute color is missing');

	const color1 = geo1.createNode('color');
	color1.setInput(0, plane1);
	pointBuilder1.setInput(0, color1);

	const container = await pointBuilder1.compute();
	assert.notOk(pointBuilder1.states.error.active());
	assert.equal(pointBuilder1.states.error.message(), null);

	const geometry = container.coreContent()!.threejsObjectsWithGeo()[0].geometry;
	const newPos = (geometry.getAttribute('position') as BufferAttribute).array;
	const expectedMatch = [0.5, 1, 0.5, 1.5, 1, 0.5, 0.5, 1, 1.5, 1.5, 1, 1.5];
	for (let i = 0; i < newPos.length; i++) {
		assert.in_delta(newPos[i], expectedMatch[i], 0.001, `${i}`);
	}
});

qUnit.test('sop/pointBuilder write attributes', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const pointBuilder1 = geo1.createNode('pointBuilder');

	pointBuilder1.setInput(0, plane1);

	const globals = pointBuilder1.createNode('globals');
	const output = pointBuilder1.createNode('output');
	const attribute1 = pointBuilder1.createNode('attribute');
	const vec3ToColor_1 = pointBuilder1.createNode('vec3ToColor');

	output.setInput('position', globals, 'position');
	vec3ToColor_1.setInput(0, globals, 'position');
	attribute1.setInput(0, vec3ToColor_1);

	attribute1.setJsType(JsConnectionPointType.COLOR);
	attribute1.p.name.set('color');
	attribute1.p.exportWhenConnected.set(true);

	const container = await pointBuilder1.compute();
	assert.notOk(pointBuilder1.states.error.active());
	assert.equal(pointBuilder1.states.error.message(), null);

	const geometry = container.coreContent()!.threejsObjectsWithGeo()[0].geometry;
	const color = (geometry.getAttribute('color') as BufferAttribute).array;
	const expectedMatch = [-0.5, 0, -0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5];
	for (let i = 0; i < color.length; i++) {
		assert.in_delta(color[i], expectedMatch[i], 0.001, `${i}`);
	}
});

qUnit.test(
	'sop/pointBuilder does not error if an attribute is missing but there are no points in the geometry',
	async (assert) => {
		const geo1 = window.geo1;
		const data1 = geo1.createNode('data');
		const data2 = geo1.createNode('data');
		const data3 = geo1.createNode('data');
		const pointBuilder1 = geo1.createNode('pointBuilder');

		data1.p.data.set(JSON.stringify([{value: -10}, {value: 0}, {value: 10}]));
		data2.p.data.set(JSON.stringify([]));
		data3.p.data.set(JSON.stringify([{otherAttrib: -10}]));

		const globals = pointBuilder1.createNode('globals');
		const output = pointBuilder1.createNode('output');
		const add1 = pointBuilder1.createNode('add');
		const attribute1 = pointBuilder1.createNode('attribute');
		const floatToVec3_1 = pointBuilder1.createNode('floatToVec3');

		output.setInput('position', add1);
		add1.setInput(0, globals, 'position');
		add1.setInput(1, floatToVec3_1);
		floatToVec3_1.setInput(0, attribute1);

		attribute1.setJsType(JsConnectionPointType.FLOAT);
		attribute1.p.name.set('value');

		const _compute = async () => {
			const container = await pointBuilder1.compute();
			const errorMessage = pointBuilder1.states.error.message();
			const pointsCount = container.pointsCount();
			return {errorMessage, pointsCount};
		};

		pointBuilder1.setInput(0, data1);
		assert.notOk((await _compute()).errorMessage, 'no error message');
		assert.equal((await _compute()).pointsCount, 3, '3 pts');

		pointBuilder1.setInput(0, data2);
		assert.notOk((await _compute()).errorMessage, 'no error message');
		assert.equal((await _compute()).pointsCount, 0, '0 pts');

		pointBuilder1.setInput(0, data3);
		assert.equal((await _compute()).errorMessage, 'attribute value is missing', 'error message');
		assert.equal((await _compute()).pointsCount, 0, '0 pts');
	}
);

}