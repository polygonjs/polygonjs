import {SceneJsonImporter} from '../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../src/engine/io/json/export/Scene';
import {Poly} from '../../../src/engine/Poly';
import {BoxSopNode} from '../../../src/engine/nodes/sop/Box';
import {OperationsComposerSopNode} from '../../../src/engine/nodes/sop/OperationsComposer';
import {TransformSopNode} from '../../../src/engine/nodes/sop/Transform';

QUnit.test('scene can be imported with a single optimized node', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	box1.flags.optimize.set(true);

	const data = new SceneJsonExporter(scene).data();

	Poly.instance().setPlayerMode(false);
	const scene_no_player = await SceneJsonImporter.loadData(data);

	Poly.instance().setPlayerMode(true);
	const scene_player = await SceneJsonImporter.loadData(data);
	assert.equal(scene_player.graph.next_id(), scene_no_player.graph.next_id() - 8);
	assert.equal(scene_player.nodesController.allNodes().length, scene_no_player.nodesController.allNodes().length);

	const box1_player = scene_player.node(box1.fullPath()) as BoxSopNode;
	assert.equal(box1_player.type, OperationsComposerSopNode.type());

	let container = await box1_player.requestContainer();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 72);
});

QUnit.test('scene can be imported with a 2 optimized nodes plugged into each other', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);
	box1.flags.optimize.set(true);
	transform1.flags.optimize.set(true);
	transform1.flags.display.set(true);

	const data = new SceneJsonExporter(scene).data();

	Poly.instance().setPlayerMode(false);
	const scene_no_player = await SceneJsonImporter.loadData(data);

	Poly.instance().setPlayerMode(true);
	const scene_player = await SceneJsonImporter.loadData(data);
	assert.equal(scene_player.graph.next_id(), scene_no_player.graph.next_id() - 33);
	assert.equal(scene_player.nodesController.allNodes().length, scene_no_player.nodesController.allNodes().length - 1);

	const transform1_player = scene_player.node(transform1.fullPath()) as TransformSopNode;
	assert.equal(transform1_player.type, OperationsComposerSopNode.type());

	let container = await transform1_player.requestContainer();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 72);
});

QUnit.test(
	'scene can be imported with a multiple optimized nodes creating a node with multiple inputs',
	async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const sphere1 = geo1.createNode('sphere');
		const add1 = geo1.createNode('add');
		const jitter1 = geo1.createNode('jitter');
		const transform1 = geo1.createNode('transform');
		const transform2 = geo1.createNode('transform');
		const merge1 = geo1.createNode('merge');
		const merge2 = geo1.createNode('merge');
		transform1.setInput(0, box1);
		jitter1.setInput(0, transform1);
		transform2.setInput(0, sphere1);
		merge1.setInput(0, jitter1);
		merge1.setInput(1, transform2);
		merge2.setInput(0, merge1);
		merge2.setInput(1, add1);
		merge2.flags.display.set(true);

		transform1.flags.optimize.set(true);
		transform2.flags.optimize.set(true);
		jitter1.flags.optimize.set(true);
		merge1.flags.optimize.set(true);
		merge2.flags.optimize.set(true);

		const data = new SceneJsonExporter(scene).data();

		Poly.instance().setPlayerMode(false);
		const scene_no_player = await SceneJsonImporter.loadData(data);

		Poly.instance().setPlayerMode(true);
		const scene_player = await SceneJsonImporter.loadData(data);
		assert.equal(scene_player.graph.next_id(), scene_no_player.graph.next_id() - 72);
		assert.equal(
			scene_player.nodesController.allNodes().length,
			scene_no_player.nodesController.allNodes().length - 4
		);

		const merge2_player = scene_player.node(merge2.fullPath()) as TransformSopNode;
		assert.equal(merge2_player.type, OperationsComposerSopNode.type());

		let container = await merge2_player.requestContainer();
		const core_group = container.coreContent();
		const geometry = core_group?.objectsWithGeo()[0].geometry;
		assert.equal(geometry?.getAttribute('position').array.length, 2955);
	}
);
