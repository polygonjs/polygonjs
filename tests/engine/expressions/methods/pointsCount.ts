import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('expression pointsCount works with path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	box2.p.size.set(`pointsCount('../${box1.name}')`);

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 24);
});

QUnit.test('expression pointsCount works with input index', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	box2.setInput(0, box1);

	box2.p.size.set('pointsCount(0)');

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 24);
});

QUnit.test('expression pointsCount updates when dependency changes', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const sphere1 = geo1.createNode('sphere');
	sphere1.flags.display.set(true);

	box1.p.divisions.set(1);

	box2.p.size.set("pointsCount('../box1')");

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 24);

	assert.ok(!box2.p.size.isDirty());
	await box2.requestContainer();
	assert.ok(!box2.isDirty(), 'box is dirty');

	// check that bbox2 is set to dirty if box1 changes
	box1.p.divisions.set(2);
	assert.ok(box2.p.size.isDirty());
	assert.ok(box2.isDirty());

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 54);

	// check that bbox2 is NOT set to dirty if box1 changes after the expression is removed
	assert.equal(box1.graphSuccessors().length, 1, 'successors');
	const graph_successor = box1.graphSuccessors()[0];
	assert.equal(graph_successor.graphNodeId(), box2.p.size.graphNodeId());
	box2.p.size.set('1+1');
	assert.ok(box2.isDirty());
	await box2.requestContainer();
	assert.ok(!box2.isDirty());
	box1.p.divisions.set(3);

	assert.equal(box1.graphSuccessors().length, 0);

	assert.ok(!box2.isDirty());
});

QUnit.skip('expression pointsCount cannot create infinite loop if scene is loaded', async (assert) => {
	// const geo1 = window.geo1
	// window.scene.mark_as_loaded();
	// const box1 = geo1.createNode('box');
	// const box2 = geo1.createNode('box');
	// box1.p.divisions.set(1);
	// box2.p.size.set("pointsCount('../box1')");
	// box2.requestContainer_p().then(() => {
	// 	assert.notOk(b.error_message());
	// 	box1.p.size.set("pointsCount('../box2')");
	// 	box1.p.size.compute().then(val=> {
	// 		console.logx1.p.size.error_message(), val);
	// 		assert.equal(box1.p.size.error_message(), "expression pointsCount error: cannot create infinite graph");
	// 		console.log("THIS DOES NOT RETURN, because the points_cloud method fails to connect to the node, as the graph is then cyclic. and the throw call fucks up somewhere in the callbacks...")
	// 		box1.requestContainer_p().then(() => {
	// 			assert.equal(box1.error_message(), "param 'size' error: expression pointsCount error: cannot create infinite graph");
	// 			done()
	// 		});
	// 	});
	// });
	//done();
});

QUnit.test('expression pointsCount fails with bad path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	box2.setInput(0, box1);

	box2.p.size.set("pointsCount('../doesnotexist')");

	await box2.p.size.compute();
	assert.ok(!box2.states.error.active());
	await box2.requestContainer();
	assert.equal(
		box2.states.error.message(),
		"param 'size' error: expression error: \"pointsCount('../doesnotexist')\" (invalid input (../doesnotexist))"
	);
});

QUnit.test('expression pointsCount fails with bad input index 1', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	box2.setInput(0, box1);

	box2.p.size.set('pointsCount(1)');

	await box2.p.size.compute();
	assert.ok(!box2.states.error.active());
	await box2.requestContainer();
	assert.equal(
		box2.states.error.message(),
		'param \'size\' error: expression error: "pointsCount(1)" (invalid input (1))'
	);
});

QUnit.test('expression pointsCount fails with bad input index 0', async (assert) => {
	const geo1 = window.geo1;
	const dummy = geo1.createNode('plane');
	dummy.flags.display.set(true);

	assert.equal(geo1.display_node_controller.display_node?.graphNodeId(), dummy.graphNodeId());

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	box2.p.size.set('pointsCount(0)');

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 1);
	assert.equal(box2.p.size.states.error.message(), 'expression error: "pointsCount(0)" (invalid input (0))');
	assert.ok(!box2.states.error.active());
	await box2.requestContainer();
	assert.equal(
		box2.states.error.message(),
		'param \'size\' error: expression error: "pointsCount(0)" (invalid input (0))'
	);

	await box2.requestContainer();
	await CoreSleep.sleep(10);

	box2.setInput(0, box1);

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 24, 'param evaluates to 24');
	assert.ok(!box2.p.size.states.error.message(), 'param has no error');
	assert.ok(box2.states.error.active(), 'box is errored');
	await box2.requestContainer();
	assert.ok(!box2.states.error.message(), 'box has no error');
});

// box1 = geo1.createNode('box')
// box2 = geo1.createNode('box')
// console.log(box1.fullPath(), box2.fullPath())

// box2.p.size.set("pointsCount(0)")

// box2.p.size.eva>
// 	assert.equal box2.p.size.error_message(), "expression pointsCount error: no node found for argument 0"
// 	assert !box2.is_errored()
// 	box2.requestContainer =>
// 		assert.equal box2.error_message(), "param 'size' error: expression pointsCount error: no node found for argument 0"

// 		console.log("==========")
// 		box2.setInput(0, box1)

// 		box2.p.size.eval =>

// 			assert.notOk box2.p.size.error_message()
// 			assert.equal box2.error_message(), "param 'size' error: expression pointsCount error: no node found for argument 0"

// 			box2.requestContainer (container)=>
// 				console.log(container)
// 				console.log(box2.error_message())
// 				assert.notOk box2.error_message()

// 				done()

QUnit.test('pointsCount: if dependent is deleted, node becomes dirty', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	box2.p.size.set("pointsCount('../box1')");

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 24);

	assert.ok(!box2.p.size.isDirty());
	await box2.requestContainer();
	assert.ok(!box2.isDirty());

	assert.equal(box2.p.size.graphAllPredecessors().length, 10, 'has 10 predecessors');
	assert.equal(box2.p.size.graphPredecessors().length, 1);
	assert.equal(box2.p.size.graphPredecessors()[0].name, 'box1');

	geo1.removeNode(box1);
	assert.ok(box2.p.size.isDirty());
	assert.ok(box2.isDirty());

	assert.equal(box2.p.size.graphAllPredecessors().length, 0);
	assert.equal(box2.p.size.graphPredecessors().length, 0);

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 24);
	assert.equal(
		box2.p.size.states.error.message(),
		'expression error: "pointsCount(\'../box1\')" (invalid input (../box1))'
	);
	// assert.equal(box2.states.error.message(), 'bla');

	// assert !box2.p.size.isDirty()
	// box2.requestContainer =>
	// 	assert !box2.isDirty()

	//  	# test if the expression can reconnect by itself
	// 	geo1.add_node(box1)
	// 	assert box2.p.size.isDirty()
	// 	#assert box2.isDirty()

	// 	box2.p.size.eval (val)=>
	// 		assert.equal val, 24
});

QUnit.test('pointsCount: if the points count of input changes, the param gets updated', async (assert) => {
	const geo1 = window.geo1;

	// create a sphere that would have the display flag
	// so that the cooking process is not confused by the geo node
	// requesting it
	const sphere = geo1.createNode('sphere');
	sphere.flags.display.set(true);

	// create the boxes we need for this test
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	const param = box2.p.size;
	param.set('pointsCount(0)');

	box2.setInput(0, box1);
	assert.equal(box1.p.divisions.value, 1);

	assert.ok(param.isDirty());
	await param.compute();
	assert.ok(!param.isDirty());
	assert.equal(param.value, 24);

	box1.p.divisions.set(2);
	assert.ok(param.isDirty());
	await param.compute();
	assert.ok(!param.isDirty());
	assert.equal(param.value, 54);

	box1.p.divisions.set(3);
	assert.ok(param.isDirty());
	await param.compute();
	assert.ok(!param.isDirty());
	assert.equal(param.value, 96);
});
