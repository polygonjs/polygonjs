import {Box3, Vector3} from 'three';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SDFBuilderSopNode} from '../../../../src/engine/nodes/sop/SDFBuilder';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {FloatParam} from '../../../../src/engine/params/Float';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';

const bbox = new Box3();
const size = new Vector3();
async function _getBbox(node: SDFBuilderSopNode) {
	const container = await node.compute();
	container.boundingBox(bbox);
	bbox.getSize(size);
	return size;
}

QUnit.test('sop/SDFBuilder simple', async (assert) => {
	const geo1 = window.geo1;
	const boxLines1 = geo1.createNode('boxLines');
	const SDFBuilder1 = geo1.createNode('SDFBuilder');

	SDFBuilder1.setInput(0, boxLines1);
	boxLines1.p.size.set(2);

	const output1 = SDFBuilder1.createNode('output');
	const SDFSphere1 = SDFBuilder1.createNode('SDFSphere');
	const globals1 = SDFBuilder1.createNode('globals');

	output1.setInput('d', SDFSphere1);
	SDFSphere1.setInput('position', globals1);
	SDFSphere1.p.radius.set(0.4);

	async function getBbox() {
		const result = await _getBbox(SDFBuilder1);
		return result;
	}
	assert.in_delta((await getBbox()).y, 0.8, 0.02);

	SDFSphere1.p.radius.set(0.6);
	assert.in_delta((await getBbox()).y, 1.2, 0.02);
	assert.in_delta((await getBbox()).x, 1.2, 0.02);

	const SDFBox1 = SDFBuilder1.createNode('SDFBox');
	const SDFSubtract1 = SDFBuilder1.createNode('SDFSubtract');
	output1.setInput('d', SDFSubtract1);
	SDFSubtract1.setInput(0, SDFBox1);
	SDFSubtract1.setInput(1, SDFSphere1);
	SDFSubtract1.p.smooth.set(0);
	SDFBox1.p.sizes.set([2, 0.5, 2]);
	assert.in_delta((await getBbox()).x, 1.08, 0.02);

	SDFSphere1.p.radius.set(0.65);
	SDFSubtract1.p.smooth.set(1);
	SDFSubtract1.p.smoothFactor.set(0.5);
	assert.in_delta((await getBbox()).x, 0.74, 0.02);
});

QUnit.test('sop/SDFBuilder with param and persisted config', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const boxLines1 = geo1.createNode('boxLines');
	const SDFBuilder1 = geo1.createNode('SDFBuilder');

	SDFBuilder1.setInput(0, boxLines1);
	boxLines1.p.size.set(2);

	const output1 = SDFBuilder1.createNode('output');
	const SDFSphere1 = SDFBuilder1.createNode('SDFSphere');
	const globals1 = SDFBuilder1.createNode('globals');
	const param1 = SDFBuilder1.createNode('param');

	output1.setInput('d', SDFSphere1);
	SDFSphere1.setInput('position', globals1);

	param1.setJsType(JsConnectionPointType.FLOAT);
	param1.p.name.set('radius');
	SDFSphere1.setInput('radius', param1);

	async function getBbox1() {
		return await _getBbox(SDFBuilder1);
	}
	assert.in_delta((await getBbox1()).y, 0, 0.02);

	const radius = SDFBuilder1.params.get('radius') as FloatParam;
	assert.ok(radius);
	assert.equal(radius.type(), ParamType.FLOAT);

	radius.set(1);
	assert.in_delta((await getBbox1()).y, 2, 0.02);

	radius.set(0.5);
	assert.in_delta((await getBbox1()).y, 1, 0.02);

	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(SDFBuilder1.usedAssembler(), async () => {
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const SDFBuilder2 = scene2.node(SDFBuilder1.path()) as SDFBuilderSopNode;
		async function getBbox2() {
			return await _getBbox(SDFBuilder2);
		}

		const radius2 = SDFBuilder2.params.get('radius')! as FloatParam;
		assert.ok(radius2);
		assert.equal(radius2.type(), ParamType.FLOAT);
		assert.equal(radius2.value, 0.5);

		assert.in_delta((await getBbox2()).y, 1, 0.02);

		radius2.set(1);
		assert.in_delta((await getBbox2()).y, 2, 0.02);
	});
});
