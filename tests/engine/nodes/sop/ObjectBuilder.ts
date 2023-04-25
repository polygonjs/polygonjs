import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {ObjectBuilderSopNode} from '../../../../src/engine/nodes/sop/ObjectBuilder';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {FloatParam} from '../../../../src/engine/params/Float';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';

QUnit.test('sop/ObjectBuilder simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, box1);
	//
	const output1 = objectBuilder1.createNode('output');
	const add1 = objectBuilder1.createNode('add');
	const globals1 = objectBuilder1.createNode('globals');
	const param1 = objectBuilder1.createNode('param');
	const floatToVec3_1 = objectBuilder1.createNode('floatToVec3');
	output1.setInput('position', add1);

	param1.setJsType(JsConnectionPointType.FLOAT);
	param1.p.name.set('offset');
	floatToVec3_1.setInput('x', param1);

	add1.setInput(0, globals1, 'position');
	add1.setInput(1, floatToVec3_1);

	async function getX() {
		const container = await objectBuilder1.compute();
		const object = container.coreContent()!.threejsObjectsWithGeo()[0];
		return object.position.x;
	}
	async function getY() {
		const container = await objectBuilder1.compute();
		const object = container.coreContent()!.threejsObjectsWithGeo()[0];
		return object.position.y;
	}

	// no addition
	assert.equal(await getX(), 0);
	assert.equal(await getY(), 0);

	// with addition
	floatToVec3_1.p.y.set(1);
	assert.equal(await getX(), 0);
	assert.equal(await getY(), 1);

	// with param change
	const offset = objectBuilder1.params.get('offset') as FloatParam;
	assert.ok(offset);
	assert.equal(offset.type(), ParamType.FLOAT);
	offset.set(1);
	assert.equal(await getX(), 1);
	assert.equal(await getY(), 1);

	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(objectBuilder1.usedAssembler(), async () => {
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const objectBuilder2 = scene2.node(objectBuilder1.path()) as ObjectBuilderSopNode;
		async function getX2() {
			const container = await objectBuilder2.compute();
			const object = container.coreContent()!.threejsObjectsWithGeo()[0];
			return object.position.x;
		}
		async function getY2() {
			const container = await objectBuilder2.compute();
			const object = container.coreContent()!.threejsObjectsWithGeo()[0];
			return object.position.y;
		}

		const offset2 = objectBuilder2.params.get('offset')! as FloatParam;
		assert.ok(offset2);
		assert.equal(offset2.type(), ParamType.FLOAT);
		assert.equal(offset2.value, 1);

		assert.equal(await getX2(), 1);
		assert.equal(await getY2(), 1);

		offset2.set(2);
		assert.equal(await getX2(), 2);
		assert.equal(await getY2(), 1);
	});
});
