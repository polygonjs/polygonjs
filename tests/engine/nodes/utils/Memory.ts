import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodesutilsMemory(qUnit: QUnit) {
	qUnit.test('nodes can dispose themselves when removed by their parents', async (assert) => {
		const scene = window.scene;
		const graph = scene.graph;

		const startGraphNodesCount = graph.nodesCount();
		graph.startDebugging();

		const root = scene.root();
		const geo = root.createNode('geo');
		const box = geo.createNode('box');
		const plane = geo.createNode('plane');
		const scatter = geo.createNode('scatter');
		scatter.setInput(0, plane);
		scatter.p.pointsCount.set(`bbox('${box.path()}')`);

		const maxGraphNodesCount = graph.nodesCount();
		assert.equal(
			maxGraphNodesCount,
			startGraphNodesCount + 139,
			`139 created, started with ${startGraphNodesCount}`
		);

		root.removeNode(geo);

		graph.stopDebugging();
		graph.printDebug();
		const finalGraphNodesCount = graph.nodesCount();
		assert.equal(
			finalGraphNodesCount,
			startGraphNodesCount,
			`graph nodes count is back to ${startGraphNodesCount} (${finalGraphNodesCount})`
		);

		scene.dispose();
		assert.equal(graph.nodesCount(), 0, `graph empty`);
		// graph.print();
	});
}
