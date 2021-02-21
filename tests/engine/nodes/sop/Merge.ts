QUnit.test('merge simple', async (assert) => {
	const geo1 = window.geo1;

	const tube1 = geo1.createNode('tube');
	const box1 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	merge1.setInput(0, box1);

	let container = await merge1.requestContainer();
	assert.equal(container.pointsCount(), 24);

	merge1.setInput(1, tube1);
	container = await merge1.requestContainer();
	assert.equal(container.pointsCount(), 100);
});

QUnit.skip('merge geos with different attributes', async (assert) => {
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

	let container = await merge1.requestContainer();
	let core_group = container.coreContent()!;
	assert.equal(core_group.pointsCount(), 12);
});

import {Points} from 'three/src/objects/Points';
import {Mesh} from 'three/src/objects/Mesh';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {MergeSopNode} from '../../../../src/engine/nodes/sop/Merge';
import {AddSopNode} from '../../../../src/engine/nodes/sop/Add';
import {PlaneSopNode} from '../../../../src/engine/nodes/sop/Plane';
QUnit.test('sop merge has predictable order in assembled objects', async (assert) => {
	const geo1 = window.geo1;

	const add1 = geo1.createNode('add');
	const plane1 = geo1.createNode('plane');

	const merge1 = geo1.createNode('merge');
	merge1.setInput(0, add1);
	merge1.setInput(1, plane1);

	let container = await merge1.requestContainer();
	let core_group = container.coreContent()!;
	let objects = core_group.objects();
	assert.equal(objects[0].constructor, Points);
	assert.equal(objects[1].constructor, Mesh);
});

QUnit.test('sop merge can have missing inputs, save and load again', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const add1 = geo1.createNode('add');
	const plane1 = geo1.createNode('plane');

	const merge1 = geo1.createNode('merge');
	merge1.setInput(0, add1);
	merge1.setInput(2, plane1);

	let container = await merge1.requestContainer();
	let core_group = container.coreContent()!;
	let objects = core_group.objects();
	assert.equal(objects[0].constructor, Points);
	assert.equal(objects[1].constructor, Mesh);

	// save
	const data = new SceneJsonExporter(scene).data();
	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();
	const add2 = scene2.node(add1.fullPath())! as AddSopNode;
	const plane2 = scene2.node(plane1.fullPath())! as PlaneSopNode;
	const merge2 = scene2.node(merge1.fullPath())! as MergeSopNode;
	assert.equal(merge2.io.inputs.input(0)?.graphNodeId(), add2.graphNodeId(), 'input 0 is add node');
	assert.equal(merge2.io.inputs.input(1)?.graphNodeId(), null, 'input 1 is empty');
	assert.equal(merge2.io.inputs.input(2)?.graphNodeId(), plane2.graphNodeId(), 'input 2 is plane node');

	container = await merge1.requestContainer();
	core_group = container.coreContent()!;
	objects = core_group.objects();
	assert.equal(objects[0].constructor, Points);
	assert.equal(objects[1].constructor, Mesh);
});

QUnit.test('sop merge can update its inputs count', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const add1 = geo1.createNode('add');
	const plane1 = geo1.createNode('plane');

	const merge1 = geo1.createNode('merge');
	merge1.p.inputsCount.set(16);
	merge1.setInput(0, add1);
	merge1.setInput(15, plane1);

	let container = await merge1.requestContainer();
	let core_group = container.coreContent()!;
	let objects = core_group.objects();
	assert.equal(objects[0].constructor, Points);
	assert.equal(objects[1].constructor, Mesh);

	// save
	const data = new SceneJsonExporter(scene).data();
	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();
	const add2 = scene2.node(add1.fullPath())! as AddSopNode;
	const plane2 = scene2.node(plane1.fullPath())! as PlaneSopNode;
	const merge2 = scene2.node(merge1.fullPath())! as MergeSopNode;
	assert.equal(merge2.io.inputs.input(0)?.graphNodeId(), add2.graphNodeId(), 'input 0 is add node');
	assert.equal(merge2.io.inputs.input(1)?.graphNodeId(), null, 'input 1 is empty');
	assert.equal(merge2.io.inputs.input(15)?.graphNodeId(), plane2.graphNodeId(), 'input 15 is plane node');

	container = await merge1.requestContainer();
	core_group = container.coreContent()!;
	objects = core_group.objects();
	assert.equal(objects[0].constructor, Points);
	assert.equal(objects[1].constructor, Mesh);
});
