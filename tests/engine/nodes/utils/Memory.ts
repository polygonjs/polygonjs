QUnit.test('nodes can dispose themselves when removed by their parents', async (assert) => {
	const scene = window.scene;

	const startGraphNodesCount = scene.graph.nodesCount();
	scene.graph.startDebugging();

	const root = scene.root();
	const geo = root.createNode('geo');
	const box = geo.createNode('box');
	const plane = geo.createNode('plane');
	const scatter = geo.createNode('scatter');
	scatter.setInput(0, plane);
	scatter.p.pointsCount.set(`bbox('${box.path()}')`);

	const maxGraphNodesCount = scene.graph.nodesCount();
	assert.equal(maxGraphNodesCount, startGraphNodesCount + 111);

	root.removeNode(geo);

	scene.graph.stopDebugging();
	scene.graph.printDebug();
	const finalGraphNodesCount = scene.graph.nodesCount();
	assert.equal(finalGraphNodesCount, startGraphNodesCount);
});
