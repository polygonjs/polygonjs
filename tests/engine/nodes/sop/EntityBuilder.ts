import type {QUnit} from '../../../helpers/QUnit';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {QuadPrimitive} from '../../../../src/core/geometry/modules/quad/QuadPrimitive';
import {rangeWithEnd} from '../../../../src/core/ArrayUtils';
import {EntityBuilderSopNode} from '../../../../src/engine/nodes/sop/EntityBuilder';
import {ForLoopJsInputName} from '../../../../src/engine/nodes/js/ForLoop';
import {JsCompareTestName} from '../../../../src/engine/nodes/js/Compare';

// const bbox = new Box3();
// const size = new Vector3();

export function testenginenodessopEntityBuilder(qUnit: QUnit) {
	// async function _getBbox(node: PointBuilderSopNode) {
	// 	const container = await node.compute();
	// 	const coreGroup = container.coreContent()!;
	// 	coreGroup.boundingBox(bbox);
	// 	bbox.getSize(size);
	// 	return {min: bbox.min, max: bbox.max, size};
	// }

	qUnit.test('sop/entityBuilder simple', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const quadPlane1 = geo1.createNode('quadPlane');
		const entityBuilder1 = geo1.createNode('entityBuilder');
		entityBuilder1.setInput(0, quadPlane1);

		quadPlane1.p.size.set([2, 2]);
		entityBuilder1.setEntity(AttribClass.PRIMITIVE);

		//
		const attribute1 = entityBuilder1.createNode('attribute');
		const add1 = entityBuilder1.createNode('add');
		const globals1 = entityBuilder1.createNode('globals');

		add1.setInput(0, globals1, 'index');
		attribute1.setInput(0, add1);
		attribute1.p.exportWhenConnected.set(true);
		attribute1.p.name.set('index2');
		attribute1.setJsType(JsConnectionPointType.INT);

		async function compute(entityBuilder: EntityBuilderSopNode) {
			const container = await entityBuilder.compute();
			const quadObject = container.coreContent()!.quadObjects()![0];
			const entitiesCount = QuadPrimitive.entitiesCount(quadObject);
			const values = rangeWithEnd(entitiesCount).map((i) => QuadPrimitive.attribValue(quadObject, i, 'index2'));
			return {values};
		}

		assert.deepEqual((await compute(entityBuilder1)).values, [0, 1, 2, 3], 'values');

		const data = await new SceneJsonExporter(scene).data();
		await AssemblersUtils.withUnregisteredAssembler(entityBuilder1.usedAssembler(), async () => {
			const scene2 = await SceneJsonImporter.loadData(data);
			await scene2.waitForCooksCompleted();
			const entityBuilder2 = scene2.node(entityBuilder1.path()) as EntityBuilderSopNode;
			assert.deepEqual((await compute(entityBuilder2)).values, [0, 1, 2, 3], 'values');
		});
	});

	qUnit.test('sop/entityBuilder with forloop', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const quadPlane1 = geo1.createNode('quadPlane');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribCreate2 = geo1.createNode('attribCreate');
		const entityBuilder1 = geo1.createNode('entityBuilder');

		attribCreate1.setInput(0, quadPlane1);
		attribCreate2.setInput(0, attribCreate1);
		entityBuilder1.setInput(0, attribCreate2);

		quadPlane1.p.size.set([3, 3]);
		attribCreate1.setAttribClass(AttribClass.PRIMITIVE);
		attribCreate2.setAttribClass(AttribClass.PRIMITIVE);
		attribCreate1.p.name.set('mine');
		attribCreate2.p.name.set('mine');
		attribCreate2.p.group.set('1-2');
		attribCreate2.p.value1.set(1);

		entityBuilder1.setEntity(AttribClass.PRIMITIVE);
		const globals1 = entityBuilder1.createNode('globals');
		const attribute1 = entityBuilder1.createNode('attribute');
		const primitiveNeighboursCount1 = entityBuilder1.createNode('primitiveNeighboursCount');
		const constant1 = entityBuilder1.createNode('constant');
		const forLoop1 = entityBuilder1.createNode('forLoop');
		const primitiveNeighbourIndex1 = forLoop1.createNode('primitiveNeighbourIndex');
		const importAttribute1 = forLoop1.createNode('importAttribute');
		const compare1 = forLoop1.createNode('compare');
		const constant2 = forLoop1.createNode('constant');
		const twoWaySwitch1 = forLoop1.createNode('twoWaySwitch');
		const add1 = forLoop1.createNode('add');
		const subnetInput1 = forLoop1.createNode('subnetInput');
		const subnetOutput1 = forLoop1.createNode('subnetOutput');

		primitiveNeighboursCount1.setInput('index', globals1, 'index');
		forLoop1.p.inputsCount.set(2);
		forLoop1.setInputType(0, JsConnectionPointType.INT);
		forLoop1.setInputType(1, JsConnectionPointType.INT);
		forLoop1.setInputName(0, 'index');
		forLoop1.setInputName(1, 'total');
		forLoop1.setInput(ForLoopJsInputName.MAX, primitiveNeighboursCount1);
		forLoop1.setInput('index', globals1, 'index');
		forLoop1.setInput('total', constant1);
		attribute1.setInput(0, forLoop1, 'total');
		attribute1.p.name.set('minesCount');
		attribute1.p.exportWhenConnected.set(true);
		attribute1.setJsType(JsConnectionPointType.INT);
		//
		primitiveNeighbourIndex1.setInput(primitiveNeighbourIndex1.p.index.name(), subnetInput1, 'index');
		primitiveNeighbourIndex1.setInput(
			primitiveNeighbourIndex1.p.neighbourIndex.name(),
			subnetInput1,
			ForLoopJsInputName.I
		);
		importAttribute1.setInput(0, primitiveNeighbourIndex1);
		importAttribute1.setJsType(JsConnectionPointType.INT);
		importAttribute1.p.name.set('mine');
		compare1.setInput(0, importAttribute1);
		compare1.setTestName(JsCompareTestName.GREATER_THAN_OR_EQUAL);
		compare1.params.get('value1')!.set(1);
		constant2.setJsType(JsConnectionPointType.INT);
		constant2.p.int.set(1);
		twoWaySwitch1.setInput(0, compare1);
		twoWaySwitch1.setInput(1, constant2);
		add1.setInput(0, twoWaySwitch1);
		add1.setInput(1, subnetInput1, 'total');
		subnetOutput1.setInput('total', add1);

		async function compute(entityBuilder: EntityBuilderSopNode, attribName: string) {
			const container = await entityBuilder.compute();
			const quadObject = container.coreContent()!.quadObjects()![0];
			const entitiesCount = QuadPrimitive.entitiesCount(quadObject);
			const values = rangeWithEnd(entitiesCount).map((i) => QuadPrimitive.attribValue(quadObject, i, attribName));
			return {values};
		}

		assert.deepEqual((await compute(entityBuilder1, 'mine')).values, [0, 1, 1, 0, 0, 0, 0, 0, 0], 'mine');
		assert.deepEqual(
			(await compute(entityBuilder1, 'minesCount')).values,
			[1, 1, 1, 1, 2, 2, 0, 0, 0],
			'minesCount'
		);

		const data = await new SceneJsonExporter(scene).data();
		await AssemblersUtils.withUnregisteredAssembler(entityBuilder1.usedAssembler(), async () => {
			const scene2 = await SceneJsonImporter.loadData(data);
			await scene2.waitForCooksCompleted();
			const entityBuilder2 = scene2.node(entityBuilder1.path()) as EntityBuilderSopNode;
			assert.deepEqual((await compute(entityBuilder2, 'mine')).values, [0, 1, 1, 0, 0, 0, 0, 0, 0], 'mine');
			assert.deepEqual(
				(await compute(entityBuilder2, 'minesCount')).values,
				[1, 1, 1, 1, 2, 2, 0, 0, 0],
				'minesCount'
			);
		});
	});
}
