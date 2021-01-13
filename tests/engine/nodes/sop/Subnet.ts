import {Vector3} from 'three/src/math/Vector3';
import {CoreSleep} from '../../../../src/core/Sleep';
import {SubnetSopNode} from '../../../../src/engine/nodes/sop/Subnet';

function create_required_nodes(node: SubnetSopNode) {
	const subnetInput1 = node.createNode('subnetInput');
	const subnetOutput1 = node.createNode('subnetOutput');
	return {subnetInput1, subnetOutput1};
}

QUnit.test('subnet simple', async (assert) => {
	await window.scene.waitForCooksCompleted();
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const subnet1 = geo1.createNode('subnet');

	assert.equal(subnet1.children().length, 0);
	const {subnetInput1, subnetOutput1} = create_required_nodes(subnet1);
	assert.equal(subnet1.children().length, 2);

	// if nothing inside yet
	let container = await subnet1.requestContainer();
	let core_group = container.coreContent();
	assert.notOk(core_group);

	const scatter1 = subnet1.createNode('scatter');
	scatter1.setInput(0, subnetInput1);
	subnetOutput1.setInput(0, scatter1);

	// we have an error if the content is invalid
	await CoreSleep.sleep(10);
	scatter1.p.pointsCount.set(100);
	container = await subnet1.requestContainer();
	core_group = container.coreContent();
	assert.notOk(core_group);
	assert.equal(
		subnet1.states.error.message(),
		'input 0 is invalid (error: input 0 is invalid (error: parent has no input 0))'
	);

	// by plugging the input
	await CoreSleep.sleep(10);
	subnet1.setInput(0, box1);
	container = await subnet1.requestContainer();
	core_group = container.coreContent()!;
	assert.equal(core_group.pointsCount(), 100);
	assert.ok(!subnet1.states.error.message());

	// and when we update the box, the content of the subnet updates
	box1.p.size.set(30);
	container = await subnet1.requestContainer();
	core_group = container.coreContent()!;
	const size = new Vector3();
	core_group.boundingBox().getSize(size);
	assert.equal(size.x, 30);
	assert.ok(!subnet1.states.error.message());
});

QUnit.test('subnet errors without subnetOutput child node', async (assert) => {
	const geo1 = window.geo1;
	await window.scene.waitForCooksCompleted();
	const subnet1 = geo1.createNode('subnet');

	assert.equal(subnet1.children().length, 0);
	const {subnetOutput1} = create_required_nodes(subnet1);
	assert.equal(subnet1.children().length, 2);
	subnet1.removeNode(subnetOutput1);

	await subnet1.requestContainer();
	assert.equal(subnet1.states.error.message(), 'no output node found inside subnet');

	// and we add a subnetOutput again
	await CoreSleep.sleep(10);
	const subnetOutput2 = subnet1.createNode('subnetOutput');
	await subnet1.requestContainer();
	assert.equal(subnet1.states.error.message(), 'inputs are missing');

	// and we add a box
	const box1 = subnet1.createNode('box');
	await CoreSleep.sleep(10);
	subnetOutput2.setInput(0, box1);
	let container = await subnet1.requestContainer();
	assert.ok(!subnet1.states.error.active());
	let core_group = container.coreContent()!;
	assert.equal(core_group.pointsCount(), 24);
});

QUnit.test('subnet works without inputs', async (assert) => {
	const geo1 = window.geo1;
	const subnet1 = geo1.createNode('subnet');

	assert.equal(subnet1.children().length, 0);
	const {subnetOutput1} = create_required_nodes(subnet1);
	assert.equal(subnet1.children().length, 2);

	const box1 = subnet1.createNode('box');
	subnetOutput1.setInput(0, box1);

	let container = await subnet1.requestContainer();
	let core_group = container.coreContent()!;
	assert.equal(core_group.pointsCount(), 24);
});
