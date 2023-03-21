import {Box3, Vector3} from 'three';
import {SolverSopNode} from '../../../../src/engine/nodes/sop/Solver';
import {BooleanOperation} from '../../../../src/engine/operations/sop/Boolean';
const tmpBox = new Box3();
function create_required_nodes(node: SolverSopNode) {
	const subnetInput1 = node.createNode('subnetInput');
	const solverPreviousFrame = node.createNode('solverPreviousFrame');
	const subnetOutput1 = node.createNode('subnetOutput');
	const switch1 = node.createNode('switch');

	switch1.setInput(0, solverPreviousFrame);
	switch1.setInput(1, subnetInput1);
	switch1.p.input.set('solverIteration() == 0');
	subnetOutput1.setInput(0, switch1);

	subnetOutput1.flags.display.set(true);

	return {switch1, subnetInput1, solverPreviousFrame, subnetOutput1};
}

QUnit.test('sop/solver simple', async (assert) => {
	const scene = window.scene;
	scene.setFrame(0);
	await scene.waitForCooksCompleted();

	scene.cooker.block();

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const solver1 = geo1.createNode('solver');
	solver1.setInput(0, box1);

	assert.equal(solver1.children().length, 0);
	const {switch1, subnetOutput1} = create_required_nodes(solver1);
	assert.equal(solver1.children().length, 4);
	const size = new Vector3();
	async function computeSolver() {
		const container = await solver1.compute();
		const coreGroup = container.coreContent()!;

		coreGroup.boundingBox(tmpBox);
		tmpBox.getSize(size);
		return {coreGroup, size};
	}

	// something inside by default
	scene.cooker.unblock();

	assert.ok((await computeSolver()).coreGroup, 'good output by default');

	scene.cooker.block();
	const scatter = solver1.createNode('scatter');
	scatter.p.pointsCount.set(1);
	scatter.p.seed.set('solverIteration()');
	scatter.setInput(0, switch1);

	const box = solver1.createNode('box');
	const copy1 = solver1.createNode('copy');
	const merge1 = solver1.createNode('merge');
	copy1.setInput(0, box);
	copy1.setInput(1, scatter);
	merge1.setInput(0, copy1);
	merge1.setCompactMode(true);

	const boolean = solver1.createNode('boolean');
	boolean.setOperation(BooleanOperation.ADD);
	boolean.setInput(0, switch1);
	boolean.setInput(1, merge1);

	subnetOutput1.setInput(0, boolean);
	subnetOutput1.flags.display.set(true);

	scene.cooker.unblock();
	await computeSolver();
	assert.in_delta(size.x, 1.85, 0.1, 'bbox size x');
	assert.ok(!solver1.states.error.message(), 'no error');

	solver1.p.iterations.set(1);
	await computeSolver();
	assert.in_delta(size.x, 1.5, 0.01, 'bbox size x 2');
	assert.ok(!solver1.states.error.message(), 'no error');

	solver1.p.iterations.set(2);
	await computeSolver();
	assert.in_delta(size.x, 1.833, 0.01, 'bbox size x 3');
	assert.ok(!solver1.states.error.message(), 'no error');

	solver1.p.iterations.set(3);
	await computeSolver();
	assert.in_delta(size.x, 1.833, 0.01, 'bbox size x 4');
	assert.ok(!solver1.states.error.message(), 'no error');

	solver1.p.iterations.set(4);
	await computeSolver();
	console.log(size.x);
	assert.in_delta(size.x, 2.21, 0.01);
	assert.ok(!solver1.states.error.message());

	solver1.p.iterations.set(5);
	await computeSolver();
	assert.in_delta(size.x, 2.21, 0.01);
	assert.ok(!solver1.states.error.message());
});
