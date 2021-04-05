QUnit.skip('a param sets its node to timedependent and back', async (assert) => {});

// assert !geo1.is_time_dependent()

// tx = geo1.param('tx')
// ty = geo1.param('ty')
// assert !tx.is_time_dependent()
// assert !ty.is_time_dependent()

// await geo1.eval_all_params()
// 	#
// assert !tx.isDirty()()
// assert !ty.isDirty()()

// tx.set_expression("$F+1")
// assert tx.isDirty()()
// assert !ty.isDirty()()
// assert geo1.isDirty()()
// assert !geo1.is_time_dependent()

// scene.context().setFrame(1)

// val = await tx.eval_p()
// assert.equal val, 2
// assert tx.is_time_dependent()
// assert geo1.is_time_dependent()

// scene.context().setFrame(2)
// val = await tx.eval_p()
// assert.equal val, 3

// ty.set_expression("$F+3")
// await ty.eval_p()
// assert geo1.is_time_dependent()

// tx.set_expression("1+1")
// await tx.eval_p()
// assert geo1.is_time_dependent()

// ty.set_expression("1+3")
// await ty.eval_p()
// assert !geo1.is_time_dependent()

// done()

QUnit.test('a param sets its node to timedependent and a scene time change sets the node to dirty', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');

	const size = box1.p.size;
	assert.ok(!size.states.time_dependent.active());

	await box1.compute();

	// sets the node as dirty
	assert.ok(!box1.isDirty());
	scene.timeController.incrementTime();
	assert.ok(!box1.isDirty());

	size.set('$F+1');
	assert.ok(size.isDirty());
	assert.ok(box1.states.time_dependent.active());
	await box1.compute();
	assert.ok(!box1.isDirty());
	scene.timeController.incrementTime();
	assert.ok(box1.isDirty());

	size.set('17');
	assert.ok(!size.isDirty());
	assert.ok(box1.isDirty());
	assert.ok(!box1.states.time_dependent.active());
	await box1.compute();
	assert.ok(!box1.isDirty());
	scene.timeController.incrementTime();
	assert.ok(!box1.isDirty());
});

QUnit.test('a param value is updated is it is time dependent', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const size = box1.p.size;

	size.set('2*$T');
	assert.equal(size.graphAllPredecessors().length, 1);
	assert.equal(size.graphAllPredecessors()[0].graphNodeId(), scene.timeController.graphNode.graphNodeId());
	assert.equal(scene.timeController.graphNode.graphSuccessors().length, 1);
	assert.equal(scene.timeController.graphNode.graphSuccessors()[0].graphNodeId(), size.graphNodeId());
	await size.compute();
	assert.equal(size.value, 0);

	scene.setFrame(12);
	await size.compute();
	assert.equal(size.value, 0.4);

	scene.setFrame(120);
	await size.compute();
	assert.equal(size.value, 4);

	size.set('2');
	assert.equal(size.graphAllPredecessors().length, 0);
	assert.equal(scene.timeController.graphNode.graphSuccessors().length, 0);
});

QUnit.test('a node with 2 params can be time dependent', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const rx = geo1.p.r.x;
	const ry = geo1.p.r.y;
	const time_graph_node = scene.timeController.graphNode;

	rx.set('5*sin($T*0.5+687) + 2.5*cos($T-12)');
	assert.equal(rx.graphAllPredecessors().length, 1);
	assert.equal(rx.graphAllPredecessors()[0].graphNodeId(), time_graph_node.graphNodeId());
	assert.equal(ry.graphAllPredecessors().length, 0);
	assert.equal(time_graph_node.graphSuccessors().length, 1);
	assert.deepEqual(
		time_graph_node
			.graphSuccessors()
			.map((n) => n.graphNodeId())
			.sort(),
		[rx].map((n) => n.graphNodeId())
	);

	ry.set('5*sin($T*0.45+541) + 2.5*cos($T+6541654)');
	assert.equal(rx.graphAllPredecessors().length, 1);
	assert.equal(rx.graphAllPredecessors()[0].graphNodeId(), time_graph_node.graphNodeId());
	assert.equal(ry.graphAllPredecessors().length, 1);
	assert.equal(ry.graphAllPredecessors()[0].graphNodeId(), time_graph_node.graphNodeId());
	assert.equal(time_graph_node.graphSuccessors().length, 2);
	assert.deepEqual(
		time_graph_node
			.graphSuccessors()
			.map((n) => n.graphNodeId())
			.sort(),
		[rx, ry].map((n) => n.graphNodeId())
	);

	rx.set(3);
	assert.equal(rx.graphAllPredecessors().length, 0);
	assert.equal(ry.graphAllPredecessors().length, 1);
	assert.equal(ry.graphAllPredecessors()[0].graphNodeId(), time_graph_node.graphNodeId());
	assert.equal(time_graph_node.graphSuccessors().length, 1);
	assert.deepEqual(
		time_graph_node
			.graphSuccessors()
			.map((n) => n.graphNodeId())
			.sort(),
		[ry].map((n) => n.graphNodeId())
	);

	ry.set(2);
	assert.equal(rx.graphAllPredecessors().length, 0);
	assert.equal(ry.graphAllPredecessors().length, 0);
	assert.equal(time_graph_node.graphSuccessors().length, 0);
});
