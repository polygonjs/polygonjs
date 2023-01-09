import {HemisphereLight, Object3D} from 'three';
import {ColorConversion} from '../../../../src/core/Color';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';

function objectsCount(object: Object3D, countStart: number = 0) {
	countStart += 1;
	for (let child of object.children) {
		countStart += objectsCount(child);
	}
	return countStart;
}
function objectNames(object: Object3D, names: string[] = []) {
	names.push(object.name);
	for (let child of object.children) {
		objectNames(child, names);
	}
	return names;
}
async function getObject(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent();
	const object = coreGroup?.objects()[0]!;
	return object;
}

QUnit.test('sop/hemisphereLight hierarchy is maintained as it is cloned', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const hemisphereLight1 = geo1.createNode('hemisphereLight');
	const transform1 = geo1.createNode('transform');

	hemisphereLight1.p.skyColor.set([0.2, 0.4, 0.7]);
	hemisphereLight1.p.skyColor.options.setOption('conversion', ColorConversion.NONE);
	transform1.setInput(0, hemisphereLight1);

	const object1 = await getObject(hemisphereLight1);
	assert.equal(objectsCount(object1), 1);
	assert.deepEqual(objectNames(object1), ['hemisphereLight1']);
	assert.deepEqual((object1 as HemisphereLight).color.toArray(), [0.2, 0.4, 0.7]);

	const object2 = await getObject(transform1);
	assert.equal(objectsCount(object2), 1);
	assert.deepEqual(objectNames(object2), ['hemisphereLight1']);
	assert.deepEqual((object2 as HemisphereLight).color.toArray(), [0.2, 0.4, 0.7]);
});

QUnit.test('sop/hemisphereLight name change is maintained', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const hemisphereLight1 = geo1.createNode('hemisphereLight');
	const transform1 = geo1.createNode('transform');
	const objectProperties1 = geo1.createNode('objectProperties');
	const transform2 = geo1.createNode('transform');

	transform1.setInput(0, hemisphereLight1);
	objectProperties1.setInput(0, transform1);
	transform2.setInput(0, objectProperties1);

	objectProperties1.p.tname.set(true);
	objectProperties1.p.name.set('myLight');

	const object1 = await getObject(transform2);
	assert.equal(objectsCount(object1), 1);
	assert.deepEqual(objectNames(object1), ['myLight']);

	objectProperties1.flags.bypass.set(true);
	const object2 = await getObject(transform2);
	assert.equal(objectsCount(object2), 1);
	assert.deepEqual(objectNames(object2), ['hemisphereLight1']);
});
