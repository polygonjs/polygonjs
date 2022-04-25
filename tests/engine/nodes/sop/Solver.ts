import {Vector3} from 'three';
import {SolverSopNode} from '../../../../src/engine/nodes/sop/Solver';
import {BooleanOperation} from '../../../../src/engine/operations/sop/Boolean';

function create_required_nodes(node: SolverSopNode) {
	const subnetInput1 = node.createNode('subnetInput');
	const solverPreviousFrame = node.createNode('solverPreviousFrame');
	const subnetOutput1 = node.createNode('subnetOutput');
	return {subnetInput1, solverPreviousFrame, subnetOutput1};
}

QUnit.test('solver simple', async (assert) => {
	const scene = window.scene;
	scene.setFrame(0);
	await scene.waitForCooksCompleted();
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const solver1 = geo1.createNode('solver');
	solver1.setInput(0, box1);

	assert.equal(solver1.children().length, 0);
	const {subnetInput1, solverPreviousFrame, subnetOutput1} = create_required_nodes(solver1);
	assert.equal(solver1.children().length, 3);

	// if nothing inside yet
	let container = await solver1.compute();
	let core_group = container.coreContent();
	assert.notOk(core_group);

	const switch1 = solver1.createNode('switch');
	switch1.setInput(0, solverPreviousFrame);
	switch1.setInput(1, subnetInput1);
	switch1.p.input.set("ch('../startFrame') == $F");

	const scatter = solver1.createNode('scatter');
	scatter.p.pointsCount.set(1);
	scatter.p.seed.set('$F');
	scatter.setInput(0, switch1);

	const box = solver1.createNode('box');
	const copy1 = solver1.createNode('copy');
	copy1.setInput(0, box);
	copy1.setInput(1, scatter);

	const boolean = solver1.createNode('boolean');
	boolean.setOperation(BooleanOperation.UNION);
	boolean.setInput(0, switch1);
	boolean.setInput(1, copy1);

	subnetOutput1.setInput(0, boolean);
	subnetOutput1.flags.display.set(true);

	container = await solver1.compute();
	core_group = container.coreContent()!;
	const size = new Vector3();
	core_group.boundingBox().getSize(size);
	assert.in_delta(size.x, 1.5, 0.1);
	assert.ok(!solver1.states.error.message());

	scene.setFrame(1);
	container = await solver1.compute();
	core_group = container.coreContent()!;
	core_group.boundingBox().getSize(size);
	assert.in_delta(size.x, 1.7, 0.1);
	assert.ok(!solver1.states.error.message());

	scene.setFrame(2);
	container = await solver1.compute();
	core_group = container.coreContent()!;
	core_group.boundingBox().getSize(size);
	assert.in_delta(size.x, 1.7, 0.1);
	assert.ok(!solver1.states.error.message());

	scene.setFrame(3);
	container = await solver1.compute();
	core_group = container.coreContent()!;
	core_group.boundingBox().getSize(size);
	assert.in_delta(size.x, 1.8, 0.1);
	assert.ok(!solver1.states.error.message());

	scene.setFrame(4);
	container = await solver1.compute();
	core_group = container.coreContent()!;
	core_group.boundingBox().getSize(size);
	assert.in_delta(size.x, 1.89, 0.1);
	assert.ok(!solver1.states.error.message());

	scene.setFrame(5);
	container = await solver1.compute();
	core_group = container.coreContent()!;
	core_group.boundingBox().getSize(size);
	assert.in_delta(size.x, 1.89, 0.1);
	assert.ok(!solver1.states.error.message());
});
