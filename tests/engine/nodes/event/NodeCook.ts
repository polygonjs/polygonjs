import {SwitchSopNode} from '../../../../src/engine/nodes/sop/Switch';
import {CoreSleep} from '../../../../src/core/Sleep';
import {NodeCookEventNode} from '../../../../src/engine/nodes/event/NodeCook';
import {ScatterSopNode} from '../../../../src/engine/nodes/sop/Scatter';
import {MergeSopNode} from '../../../../src/engine/nodes/sop/Merge';
import {BoxSopNode} from '../../../../src/engine/nodes/sop/Box';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';

QUnit.test('event nodeCook simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	const events = scene.root().createNode('eventsNetwork');

	const box1 = geo1.createNode('box');
	const scatter1 = geo1.createNode('scatter');
	const scatter2 = geo1.createNode('scatter');
	const scatter3 = geo1.createNode('scatter');
	const merge1 = geo1.createNode('merge');
	const switch1 = geo1.createNode('switch');
	const switch2 = geo1.createNode('switch');

	await scene.waitForCooksCompleted();

	const nodeCook1 = events.createNode('nodeCook');
	const set_param1 = events.createNode('setParam');
	const set_param2 = events.createNode('setParam');

	scatter1.setInput(0, box1);
	scatter2.setInput(0, box1);
	scatter3.setInput(0, box1);
	merge1.setInput(0, scatter1);
	merge1.setInput(1, scatter2);
	merge1.setInput(2, scatter3);

	assert.ok(scene.loadingController.loaded());
	nodeCook1.p.mask.set('*scatter*');
	set_param1.p.param.set(switch1.p.input.path());
	set_param1.p.number.set(1);
	set_param2.p.param.set(switch2.p.input.path());
	set_param2.p.number.set(1);
	set_param1.setInput(0, nodeCook1, NodeCookEventNode.OUTPUT_FIRST_NODE);
	set_param2.setInput(0, nodeCook1, NodeCookEventNode.OUTPUT_ALL_NODES);

	assert.equal(switch1.p.input.value, 0);
	await scatter1.compute();
	await CoreSleep.sleep(100);
	assert.equal(switch1.p.input.value, 1);

	assert.equal(switch2.p.input.value, 0);
	await merge1.compute();
	await CoreSleep.sleep(100);
	assert.equal(switch2.p.input.value, 1);

	switch1.p.input.set(0);
	switch2.p.input.set(0);

	await saveAndLoadScene(scene, async (scene2) => {
		await scene2.waitForCooksCompleted();
		const scatter1_2 = scene2.node(scatter1.path()) as ScatterSopNode;
		const merge1_2 = scene2.node(merge1.path()) as MergeSopNode;
		const switch1_2 = scene2.node(switch1.path()) as SwitchSopNode;
		const switch2_2 = scene2.node(switch2.path()) as SwitchSopNode;
		const events_2 = scene2.node(events.path()) as SwitchSopNode;
		const nodeCook1_2 = scene2.node(nodeCook1.path()) as SwitchSopNode;

		assert.equal(switch1_2.p.input.value, 0);
		await scatter1_2.compute();
		await CoreSleep.sleep(100);
		assert.equal(switch1_2.p.input.value, 1);

		assert.equal(switch2_2.p.input.value, 0);
		await merge1_2.compute();
		await CoreSleep.sleep(100);
		assert.equal(switch2_2.p.input.value, 1);

		assert.equal(scatter1_2.cookController.onCookEndCallbackNames()?.length, 1, 'one callback');
		events_2.removeNode(nodeCook1_2);
		assert.notOk(scatter1_2.cookController.onCookEndCallbackNames(), 'all callbacks removed');
	});
	assert.equal(scatter1.cookController.onCookEndCallbackNames()?.length, 1, 'one callback');
	events.removeNode(nodeCook1);
	assert.notOk(scatter1.cookController.onCookEndCallbackNames(), 'all callbacks removed');
});

QUnit.test('event nodeCook can trigger a node cook multiple times', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	const events = scene.root().createNode('eventsNetwork');

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	box1.flags.display.set(true);

	await scene.waitForCooksCompleted();

	const nodeCook1 = events.createNode('nodeCook');
	const setParam1 = events.createNode('setParam');

	nodeCook1.p.registerOnlyFirstCooks.set(false);

	setParam1.p.param.set(box2.p.size.path());
	setParam1.p.number.set(1);
	setParam1.p.increment.set(true);
	setParam1.setInput(0, nodeCook1, NodeCookEventNode.OUTPUT_EACH_NODE);

	assert.ok(scene.loadingController.loaded());
	nodeCook1.p.mask.set(box1.path());
	nodeCook1.p.updateResolve.pressButton();
	await CoreSleep.sleep(100);
	assert.equal(nodeCook1.resolvedNodes().length, 1);
	assert.equal(nodeCook1.resolvedNodes()[0].graphNodeId(), box1.graphNodeId());

	box1.p.size.set(box1.pv.size + 1);
	await CoreSleep.sleep(100);
	assert.equal(box2.pv.size, 3);

	box1.p.size.set(box1.pv.size + 1);
	await CoreSleep.sleep(100);
	assert.equal(box2.pv.size, 4);

	box1.p.size.set(box1.pv.size + 1);
	await CoreSleep.sleep(100);
	assert.equal(box2.pv.size, 5);

	await saveAndLoadScene(scene, async (scene2) => {
		await scene2.waitForCooksCompleted();
		const box1_2 = scene2.node(box1.path()) as BoxSopNode;
		const box2_2 = scene2.node(box2.path()) as BoxSopNode;

		box1_2.p.size.set(box1_2.pv.size + 1);
		await CoreSleep.sleep(100);
		assert.equal(box2_2.pv.size, 7);

		box1_2.p.size.set(box1_2.pv.size + 1);
		await CoreSleep.sleep(100);
		assert.equal(box2_2.pv.size, 8);
	});
});

QUnit.test('event nodeCook functions event if the node is part of the root loading watched nodes', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	const events = scene.root().createNode('eventsNetwork');

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	scene.root().p.nodesMask.set('*/box*');
	box1.flags.display.set(true);

	await scene.waitForCooksCompleted();

	const nodeCook1 = events.createNode('nodeCook');
	const setParam1 = events.createNode('setParam');

	nodeCook1.p.registerOnlyFirstCooks.set(false);

	setParam1.p.param.set(box2.p.size.path());
	setParam1.p.number.set(1);
	setParam1.p.increment.set(true);
	setParam1.setInput(0, nodeCook1, NodeCookEventNode.OUTPUT_EACH_NODE);

	assert.ok(scene.loadingController.loaded(), 'loaded');
	nodeCook1.p.mask.set(box1.path());
	nodeCook1.p.updateResolve.pressButton();
	await CoreSleep.sleep(100);
	assert.equal(nodeCook1.resolvedNodes().length, 1, '1 resolved node');
	assert.equal(nodeCook1.resolvedNodes()[0].graphNodeId(), box1.graphNodeId(), 'save node');

	box1.p.size.set(box1.pv.size + 1);
	await CoreSleep.sleep(100);
	assert.equal(box2.pv.size, 3, '3');

	box1.p.size.set(box1.pv.size + 1);
	await CoreSleep.sleep(100);
	assert.equal(box2.pv.size, 4, '4');

	box1.p.size.set(box1.pv.size + 1);
	await CoreSleep.sleep(100);
	assert.equal(box2.pv.size, 5, '5');

	await saveAndLoadScene(scene, async (scene2) => {
		const box1_2 = scene2.node(box1.path()) as BoxSopNode;
		const box2_2 = scene2.node(box2.path()) as BoxSopNode;
		assert.equal(box2_2.pv.size, 5, '5 (b)');

		await scene2.waitForCooksCompleted();
		assert.equal(box2_2.pv.size, 5, '5 (c)');
		await scene2.root().loadProgress.watchNodesProgress((nodesCookProgress, args) => {
			// this._onNodesCookProgress(nodesCookProgress, args);
		});

		assert.equal(box2_2.pv.size, 6, '6');

		box1_2.p.size.set(box1_2.pv.size + 1);
		await CoreSleep.sleep(100);
		assert.equal(box2_2.pv.size, 7, '7');

		box1_2.p.size.set(box1_2.pv.size + 1);
		await CoreSleep.sleep(100);
		assert.equal(box2_2.pv.size, 8, '8');
	});
});
