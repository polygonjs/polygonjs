import type {QUnit} from '../../../helpers/QUnit';
import {Points, Mesh} from 'three';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {MergeSopNode} from '../../../../src/engine/nodes/sop/Merge';
import {AddSopNode} from '../../../../src/engine/nodes/sop/Add';
import {PlaneSopNode} from '../../../../src/engine/nodes/sop/Plane';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {CadObject} from '../../../../src/core/geometry/modules/cad/CadObject';
import {CadGeometryType} from '../../../../src/core/geometry/modules/cad/CadCommon';
import {AttribClass, AttribType} from '../../../../src/core/geometry/Constant';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
import {pointsFromThreejsObject} from '../../../../src/core/geometry/modules/three/CoreThreejsPointUtils';
import {Object3DWithGeometry} from '../../../../src/core/geometry/Group';
export function testenginenodessopMerge(qUnit: QUnit) {
	qUnit.test('sop/merge simple', async (assert) => {
		const geo1 = window.geo1;

		const tube1 = geo1.createNode('tube');
		const box1 = geo1.createNode('box');
		const merge1 = geo1.createNode('merge');
		merge1.setInput(0, box1);

		let container = await merge1.compute();
		assert.equal(container.coreContent()!.pointsCount(), 24);

		merge1.setInput(1, tube1);
		container = await merge1.compute();
		assert.equal(container.coreContent()!.pointsCount(), 100);
	});

	qUnit.skip('sop/merge geos with different attributes', async (assert) => {
		const geo1 = window.geo1;

		const sphere1 = geo1.createNode('sphere');
		const box1 = geo1.createNode('box');

		const attrib_create1 = geo1.createNode('attribCreate');
		attrib_create1.setInput(0, box1);
		attrib_create1.p.name.set('blend');
		attrib_create1.p.size.set(1);
		attrib_create1.p.value1.set(2);

		const attrib_create2 = geo1.createNode('attribCreate');
		attrib_create2.setInput(0, sphere1);
		attrib_create2.p.name.set('selected');
		attrib_create2.p.size.set(1);
		attrib_create2.p.value1.set(1);

		const merge1 = geo1.createNode('merge');
		merge1.setInput(0, attrib_create1);
		merge1.setInput(1, attrib_create2);

		let container = await merge1.compute();
		let core_group = container.coreContent()!;
		assert.equal(core_group.pointsCount(), 12);
	});

	qUnit.test('sop/merge has predictable order in assembled objects', async (assert) => {
		const geo1 = window.geo1;

		const add1 = geo1.createNode('add');
		const plane1 = geo1.createNode('plane');

		const merge1 = geo1.createNode('merge');
		merge1.setInput(0, add1);
		merge1.setInput(1, plane1);

		let container = await merge1.compute();
		let core_group = container.coreContent()!;
		let objects = core_group.allObjects();
		assert.equal(objects[0].constructor, Points);
		assert.equal(objects[1].constructor, Mesh);
	});

	qUnit.test('sop/merge can have missing inputs, save and load again', async (assert) => {
		const geo1 = window.geo1;
		const scene = window.scene;

		const add1 = geo1.createNode('add');
		const plane1 = geo1.createNode('plane');

		const merge1 = geo1.createNode('merge');
		merge1.setInput(0, add1);
		merge1.setInput(2, plane1);

		let container = await merge1.compute();
		let core_group = container.coreContent()!;
		let objects = core_group.allObjects();
		assert.equal(objects[0].constructor, Points);
		assert.equal(objects[1].constructor, Mesh);

		// save
		const data = await new SceneJsonExporter(scene).data();
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const add2 = scene2.node(add1.path())! as AddSopNode;
		const plane2 = scene2.node(plane1.path())! as PlaneSopNode;
		const merge2 = scene2.node(merge1.path())! as MergeSopNode;
		assert.equal(merge2.io.inputs.input(0)?.graphNodeId(), add2.graphNodeId(), 'input 0 is add node');
		assert.equal(merge2.io.inputs.input(1)?.graphNodeId(), null, 'input 1 is empty');
		assert.equal(merge2.io.inputs.input(2)?.graphNodeId(), plane2.graphNodeId(), 'input 2 is plane node');

		container = await merge1.compute();
		core_group = container.coreContent()!;
		objects = core_group.allObjects();
		assert.equal(objects[0].constructor, Points);
		assert.equal(objects[1].constructor, Mesh);
	});

	qUnit.test('sop/merge can update its inputs count', async (assert) => {
		const geo1 = window.geo1;
		const scene = window.scene;

		const add1 = geo1.createNode('add');
		const plane1 = geo1.createNode('plane');

		const merge1 = geo1.createNode('merge');
		merge1.p.inputsCount.set(16);
		merge1.setInput(0, add1);
		merge1.setInput(15, plane1);

		let container = await merge1.compute();
		let core_group = container.coreContent()!;
		let objects = core_group.allObjects();
		assert.equal(objects[0].constructor, Points);
		assert.equal(objects[1].constructor, Mesh);

		// save
		const data = await new SceneJsonExporter(scene).data();
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const add2 = scene2.node(add1.path())! as AddSopNode;
		const plane2 = scene2.node(plane1.path())! as PlaneSopNode;
		const merge2 = scene2.node(merge1.path())! as MergeSopNode;
		assert.equal(merge2.io.inputs.input(0)?.graphNodeId(), add2.graphNodeId(), 'input 0 is add node');
		assert.equal(merge2.io.inputs.input(1)?.graphNodeId(), null, 'input 1 is empty');
		assert.equal(merge2.io.inputs.input(15)?.graphNodeId(), plane2.graphNodeId(), 'input 15 is plane node');

		container = await merge1.compute();
		core_group = container.coreContent()!;
		objects = core_group.allObjects();
		assert.equal(objects[0].constructor, Points);
		assert.equal(objects[1].constructor, Mesh);
	});

	qUnit.test('sop/merge maintains its inputs count when nothing is connected to it', async (assert) => {
		const geo1 = window.geo1;
		const scene = window.scene;

		const merge1 = geo1.createNode('merge');
		merge1.p.inputsCount.set(20);

		await merge1.compute();

		// save
		const data = await new SceneJsonExporter(scene).data();
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const geo2 = scene2.node(geo1.path())! as GeoObjNode;
		const merge2 = scene2.node(merge1.path())! as MergeSopNode;
		assert.equal(merge2.io.inputs.maxInputsCount(), 20);
		const plane1 = geo2.createNode('plane');
		merge2.setInput(15, plane1);
		assert.equal(merge2.io.inputs.inputs()[15]?.graphNodeId(), plane1.graphNodeId());
		for (let i = 0; i < 20; i++) {
			merge2.setInput(i, plane1);
		}
		assert.equal(merge2.io.inputs.inputs()[19]?.graphNodeId(), plane1.graphNodeId());
	});

	qUnit.test('sop/merge compact preserves object properties', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const objectProperties1 = geo1.createNode('objectProperties');
		const merge1 = geo1.createNode('merge');
		objectProperties1.setInput(0, box1);
		merge1.setInput(0, objectProperties1);

		objectProperties1.p.tcastShadow.set(true);
		objectProperties1.p.castShadow.set(false);
		merge1.setCompactMode(true);

		async function getObjectPropertyProperty() {
			const container = await objectProperties1.compute();
			const object = container.coreContent()?.threejsObjects()[0]!;
			return object.castShadow;
		}
		async function getMergeProperty() {
			const container = await merge1.compute();
			const object = container.coreContent()?.threejsObjects()[0]!;
			return object.castShadow;
		}

		assert.equal(await getObjectPropertyProperty(), false);
		assert.equal(await getMergeProperty(), false);

		objectProperties1.p.castShadow.set(true);
		assert.equal(await getObjectPropertyProperty(), true);
		assert.equal(await getMergeProperty(), true);

		objectProperties1.p.castShadow.set(false);
		assert.equal(await getObjectPropertyProperty(), false);
		assert.equal(await getMergeProperty(), false);
	});

	qUnit.test('sop/merge with preserveMaterials', async (assert) => {
		const geo1 = window.geo1;
		const MAT = window.MAT;

		const meshBasic1 = MAT.createNode('meshBasic');
		const meshBasic2 = MAT.createNode('meshBasic');

		const box1 = geo1.createNode('box');
		const box2 = geo1.createNode('box');
		const box3 = geo1.createNode('box');
		const material1 = geo1.createNode('material');
		const material2 = geo1.createNode('material');
		const material3 = geo1.createNode('material');
		const merge1 = geo1.createNode('merge');

		material1.setInput(0, box1);
		material2.setInput(0, box2);
		material3.setInput(0, box3);

		material1.p.material.setNode(meshBasic1);
		material2.p.material.setNode(meshBasic2);
		material3.p.material.setNode(meshBasic2);
		merge1.setInput(0, material1);
		merge1.setInput(1, material2);
		merge1.setInput(2, material3);

		async function getObjectsCount() {
			const container = await merge1.compute();
			const objects = container.coreContent()?.threejsObjects()!;
			return objects.length;
		}

		assert.equal(await getObjectsCount(), 3);

		merge1.setCompactMode(true);
		assert.equal(await getObjectsCount(), 2);

		merge1.p.preserveMaterials.set(false);
		assert.equal(await getObjectsCount(), 1);
	});

	qUnit.test('sop/merge preserves string attributes', async (assert) => {
		const geo1 = window.geo1;

		function _pointWithAttribute(attribValue: string) {
			const add1 = geo1.createNode('add');
			const attribCreate1 = geo1.createNode('attribCreate');
			attribCreate1.setInput(0, add1);

			attribCreate1.setAttribClass(AttribClass.POINT);
			attribCreate1.setAttribType(AttribType.STRING);
			attribCreate1.p.name.set('t');

			attribCreate1.p.string.set(attribValue);

			return attribCreate1;
		}
		function _merge(nodes: BaseSopNodeType[]) {
			const merge = geo1.createNode('merge');
			merge.p.compact.set(true);
			let i = 0;
			for (const node of nodes) {
				merge.setInput(i, node);
				i++;
			}
			return merge;
		}
		async function attribValues(node: BaseSopNodeType) {
			const container = await node.compute();
			const coreGroup = container.coreContent()!;
			const objects = coreGroup.threejsObjects();
			const values: string[] = [];
			for (const object of objects) {
				if ((object as Object3DWithGeometry).geometry) {
					const points = pointsFromThreejsObject(object as Object3DWithGeometry);
					for (const point of points) {
						const attribValue = point.attribValue('t') as string;
						values.push(attribValue);
					}
				}
			}
			return values;
		}
		const a = _pointWithAttribute('a');
		const b = _pointWithAttribute('b');
		const c = _pointWithAttribute('c');
		const d = _pointWithAttribute('d');

		async function _testABC() {
			const m1 = _merge([a, b]);
			const m2 = _merge([m1, c]);
			assert.deepEqual(await attribValues(m2), ['a', 'b', 'c']);
		}
		async function _testABCD() {
			const m1 = _merge([a, b]);
			const m2 = _merge([c, d]);
			const m3 = _merge([m1, m2]);
			assert.deepEqual(await attribValues(m3), ['a', 'b', 'c', 'd']);
		}
		async function _testCDAB() {
			const m1 = _merge([c, d]);
			const m2 = _merge([a, b]);
			const m3 = _merge([m1, m2]);
			assert.deepEqual(await attribValues(m3), ['c', 'd', 'a', 'b']);
		}

		await _testABC();
		await _testABCD();
		await _testCDAB();
	});

	qUnit.test('sop/merge cad', async (assert) => {
		const geo1 = window.geo1;

		const CADPoint1 = geo1.createNode('CADPoint');
		const CADPoint2 = geo1.createNode('CADPoint');
		const transform1 = geo1.createNode('transform');
		const transform2 = geo1.createNode('transform');
		const CADSegment1 = geo1.createNode('CADSegment');
		const merge1 = geo1.createNode('merge');

		CADSegment1.setInput(0, CADPoint1);
		transform1.setInput(0, CADPoint2);
		CADSegment1.setInput(1, transform1);
		transform2.setInput(0, CADSegment1);
		merge1.setInput(0, CADSegment1);

		transform1.p.t.y.set(1);
		transform2.p.t.y.set(1);

		async function getObjectsCount() {
			const container = await merge1.compute();
			const objects = container.coreContent()?.cadObjects()!;
			return {
				count: objects.length,
				types: objects.map((o: CadObject<CadGeometryType>) => o.type),
			};
		}

		assert.equal((await getObjectsCount()).count, 1);
		assert.deepEqual((await getObjectsCount()).types, ['CADEdge']);

		merge1.setInput(1, transform2);
		assert.equal((await getObjectsCount()).count, 2);
		assert.deepEqual((await getObjectsCount()).types, ['CADEdge', 'CADEdge']);

		merge1.setCompactMode(true);
		assert.equal((await getObjectsCount()).count, 1);
		assert.deepEqual((await getObjectsCount()).types, ['CADWire']);
	});

	qUnit.test('sop/merge quad', async (assert) => {
		const geo1 = window.geo1;
		const quadPlane1 = geo1.createNode('quadPlane');
		const quadPlane2 = geo1.createNode('quadPlane');
		const transform1 = geo1.createNode('transform');
		const merge1 = geo1.createNode('merge');

		transform1.setInput(0, quadPlane2);
		merge1.setInput(0, quadPlane1);
		merge1.setInput(1, transform1);

		transform1.p.t.y.set(1);

		async function compute() {
			const container = await merge1.compute();
			const objects = container.coreContent()?.quadObjects()!;
			const firstObject = objects[0];
			const firstGeometry = firstObject.geometry;
			return {objects, firstGeometry};
		}
		assert.equal((await compute()).objects.length, 2, '2 objects');
		assert.deepEqual((await compute()).firstGeometry.index, [0, 1, 3, 2]);
		assert.equal((await compute()).firstGeometry.attributes['position'].array.length, 4 * 3);

		merge1.p.compact.set(true);
		assert.equal((await compute()).objects.length, 1, '1 merged object');
		assert.deepEqual((await compute()).firstGeometry.index, [0, 1, 3, 2, 4, 5, 7, 6]);
		assert.equal((await compute()).firstGeometry.attributes['position'].array.length, 8 * 3);
		assert.equal((await compute()).firstGeometry.attributes['position'].array[5 * 3 + 1], 1);
	});
}
