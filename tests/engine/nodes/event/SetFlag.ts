import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodeseventSetFlag(qUnit: QUnit) {
qUnit.test('event/setFlag simple display flag', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const geo2 = scene.root().createNode('geo');
	const geo3 = scene.root().createNode('geo');
	geo1.setName('geo_1');
	geo2.setName('geo_2');
	geo3.setName('geo3');
	const nodes = [geo1, geo2, geo3];

	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const setFlag = eventsNetwork.createNode('setFlag');
	const button = eventsNetwork.createNode('button');

	setFlag.setInput(0, button);

	setFlag.p.mask.set('/geo_*');
	setFlag.p.tdisplay.set(1);
	setFlag.p.display.set(0);
	setFlag.p.tbypass.set(0);

	assert.deepEqual(
		nodes.map((n) => n.flags.display.active()),
		[true, true, true]
	);
	button.p.dispatch.pressButton();
	assert.deepEqual(
		nodes.map((n) => n.flags.display.active()),
		[false, false, true]
	);
});

qUnit.test('event/setFlag simple bypass flag', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const sphere1 = geo1.createNode('sphere');
	sphere1.flags.display.set(true);
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');
	const transform3 = geo1.createNode('transform');
	transform1.setName('transform_1');
	transform2.setName('transform_2');
	transform3.setName('transform3');
	const nodes = [transform1, transform2, transform3];

	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const setFlag = eventsNetwork.createNode('setFlag');
	const button = eventsNetwork.createNode('button');

	setFlag.setInput(0, button);

	setFlag.p.mask.set('/geo1/transform_*');
	setFlag.p.tdisplay.set(0);
	setFlag.p.display.set(0);
	setFlag.p.tbypass.set(1);
	setFlag.p.bypass.set(1);

	assert.deepEqual(
		nodes.map((n) => n.flags.bypass.active()),
		[false, false, false]
	);
	button.p.dispatch.pressButton();
	assert.deepEqual(
		nodes.map((n) => n.flags.bypass.active()),
		[true, true, false]
	);
});

}