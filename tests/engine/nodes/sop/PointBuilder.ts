import {Box3, Vector3} from 'three';
import {PointBuilderSopNode} from '../../../../src/engine/nodes/sop/PointBuilder';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {FloatParam} from '../../../../src/engine/params/Float';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';

const bbox = new Box3();
const size = new Vector3();
async function _getBbox(node: PointBuilderSopNode) {
	const container = await node.compute();
	container.boundingBox(bbox);
	bbox.getSize(size);
	return {min: bbox.min, max: bbox.max, size};
}

QUnit.test('sop/pointBuilder simple', async (assert) => {
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
