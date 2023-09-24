import type {QUnit} from '../../../helpers/QUnit';
import {Vector3, Box3, Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {SubnetSopNode} from '../../../../src/engine/nodes/sop/Subnet';
export function testenginenodessopSubnet(qUnit: QUnit) {
	const tmpBbox = new Box3();
	const tmpSize = new Vector3();
	const tmpCenter = new Vector3();

	function create_required_nodes(node: SubnetSopNode) {
		const subnetInput1 = node.createNode('subnetInput');
		const subnetOutput1 = node.createNode('subnetOutput');
		return {subnetInput1, subnetOutput1};
	}

	qUnit.test('sop/subnet simple', async (assert) => {
		await window.scene.waitForCooksCompleted();
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const subnet1 = geo1.createNode('subnet');

		assert.equal(subnet1.children().length, 0);
		const {subnetInput1, subnetOutput1} = create_required_nodes(subnet1);
		assert.equal(subnet1.children().length, 2);

		// if nothing inside yet
		let container = await subnet1.compute();
		let core_group = container.coreContent();
		assert.notOk(core_group);

		const scatter1 = subnet1.createNode('scatter');
		scatter1.setInput(0, subnetInput1);
		subnetOutput1.setInput(0, scatter1);

		// we have an error if the content is invalid
		await CoreSleep.sleep(10);
		scatter1.p.pointsCount.set(100);
		container = await subnet1.compute();
		core_group = container.coreContent();
		assert.notOk(core_group);
		assert.equal(
			subnet1.states.error.message(),
			'input 0 is invalid (error: input 0 is invalid (error: parent has no input 0))'
		);

		// by plugging the input
		await CoreSleep.sleep(10);
		subnet1.setInput(0, box1);
		container = await subnet1.compute();
		core_group = container.coreContent()!;
		assert.equal(core_group.pointsCount(), 100);
		assert.ok(!subnet1.states.error.message());

		// and when we update the box, the content of the subnet updates
		box1.p.size.set(30);
		container = await subnet1.compute();
		core_group = container.coreContent()!;

		core_group.boundingBox(tmpBbox);
		tmpBbox.getSize(tmpSize);
		assert.equal(tmpSize.x, 30);
		assert.ok(!subnet1.states.error.message());
	});

	qUnit.test('sop/subnet errors without subnetOutput child node', async (assert) => {
		const geo1 = window.geo1;
		await window.scene.waitForCooksCompleted();
		const subnet1 = geo1.createNode('subnet');

		assert.equal(subnet1.children().length, 0);
		const {subnetOutput1} = create_required_nodes(subnet1);
		assert.equal(subnet1.children().length, 2);
		subnet1.removeNode(subnetOutput1);

		await subnet1.compute();
		assert.equal(subnet1.states.error.message(), 'no output node found inside subnet');

		// and we add a subnetOutput again
		await CoreSleep.sleep(10);
		const subnetOutput2 = subnet1.createNode('subnetOutput');
		await subnet1.compute();
		assert.equal(subnet1.states.error.message(), 'inputs are missing');

		// and we add a box
		const box1 = subnet1.createNode('box');
		await CoreSleep.sleep(10);
		subnetOutput2.setInput(0, box1);
		let container = await subnet1.compute();
		assert.ok(!subnet1.states.error.active());
		let core_group = container.coreContent()!;
		assert.equal(core_group.pointsCount(), 24);
	});

	qUnit.test('sop/subnet works without inputs', async (assert) => {
		const geo1 = window.geo1;
		const subnet1 = geo1.createNode('subnet');

		assert.equal(subnet1.children().length, 0);
		const {subnetOutput1} = create_required_nodes(subnet1);
		assert.equal(subnet1.children().length, 2);

		const box1 = subnet1.createNode('box');
		subnetOutput1.setInput(0, box1);

		let container = await subnet1.compute();
		let core_group = container.coreContent()!;
		assert.equal(core_group.pointsCount(), 24);
	});

	qUnit.test('sop/subnet output override', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const objectProperties1 = geo1.createNode('objectProperties');
		const subnet1 = geo1.createNode('subnet');
		const transform1 = geo1.createNode('transform');
		const {subnetOutput1, subnetInput1} = create_required_nodes(subnet1);

		objectProperties1.setInput(0, box1);
		subnet1.setInput(0, objectProperties1);
		transform1.setInput(0, subnet1);
		subnetOutput1.setInput(0, subnetInput1);

		objectProperties1.p.tname.set(true);
		objectProperties1.p.name.set('myBox');
		transform1.flags.display.set(true);

		async function _getCenter() {
			await scene.waitForCooksCompleted();
			await CoreSleep.sleep(50);
			const object = scene.threejsScene().getObjectByName('myBox')! as Mesh;
			object.geometry.computeBoundingBox();
			object.geometry.boundingBox!.getCenter(tmpCenter);
			return tmpCenter;
		}

		assert.equal((await _getCenter()).y, 0);
		transform1.p.t.set([0, 1, 0]);
		assert.equal((await _getCenter()).y, 1);

		// add nodes inside subnet
		const transform2 = subnet1.createNode('transform');
		const transform3 = subnet1.createNode('transform');

		transform2.setInput(0, subnetInput1);
		transform3.setInput(0, subnetInput1);
		subnetOutput1.setInput(0, transform3);

		transform2.p.t.y.set(10);
		transform3.p.t.y.set(-10);

		assert.equal((await _getCenter()).y, -9);

		transform2.flags.display.set(true);
		assert.equal((await _getCenter()).y, -9);

		subnet1.setOverrideOutputNode(true);
		assert.equal((await _getCenter()).y, 10);

		subnet1.setOverrideOutputNode(false);
		assert.equal((await _getCenter()).y, -9);

		subnet1.setOverrideOutputNode(true);
		transform3.flags.display.set(true);
		assert.equal((await _getCenter()).y, -10);

		transform2.flags.display.set(true);
		assert.equal((await _getCenter()).y, 10);

		// add another subnet
		subnet1.setOverrideOutputNode(false);
		const subnet2 = subnet1.createNode('subnet');
		const subnet2Children = create_required_nodes(subnet2);
		const subnetInput2 = subnet2Children.subnetInput1;
		const subnetOutput2 = subnet2Children.subnetOutput1;

		const transform4 = subnet2.createNode('transform');
		const transform5 = subnet2.createNode('transform');
		subnet2.setInput(0, subnetInput1);
		transform4.setInput(0, subnetInput2);
		transform5.setInput(0, subnetInput2);
		subnetOutput2.setInput(0, transform5);
		transform4.p.t.y.set(100);
		transform5.p.t.y.set(-100);

		assert.notOk(subnet2.flags.display.active(), 'subnet2 is not displayed');
		transform4.flags.display.set(true);
		assert.equal((await _getCenter()).y, -9);

		subnet2.setOverrideOutputNode(true);
		assert.equal((await _getCenter()).y, 100);

		transform5.flags.display.set(true);
		assert.equal((await _getCenter()).y, -100);

		subnet2.setOverrideOutputNode(false);
		assert.equal((await _getCenter()).y, -9);
	});
}
