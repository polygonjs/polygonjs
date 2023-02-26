import {BufferAttribute, InstancedBufferGeometry} from 'three';
import {Attribute} from '../../../../src/core/geometry/Attribute';
import {InstanceAttrib} from '../../../../src/core/geometry/Instancer';
import {InstanceUpdateMode} from '../../../../src/engine/operations/sop/InstanceUpdate';
import {createRequiredNodes} from './Instance';

QUnit.test('instanceUpdate simple on geo mode', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	plane1.p.size.set([5.12, 5.14]);
	plane1.p.stepSize.set(1.1437);
	const box1 = geo1.createNode('box');
	const instance1 = geo1.createNode('instance');
	createRequiredNodes(instance1);
	instance1.setInput(0, box1);
	instance1.setInput(1, plane1);

	const noise1 = geo1.createNode('noise');
	const instanceUpdate1 = geo1.createNode('instanceUpdate');
	instanceUpdate1.setMode(InstanceUpdateMode.GEO);

	noise1.setInput(0, box1);
	instanceUpdate1.setInput(0, instance1);
	instanceUpdate1.setInput(1, noise1);

	async function getPosition() {
		let container = await instanceUpdate1.compute();
		let core_group = container.coreContent()!;
		let objects = core_group.objectsWithGeo();
		let first_object = objects[0];
		let first_geo = first_object.geometry as InstancedBufferGeometry;
		return (first_geo.getAttribute(Attribute.POSITION) as BufferAttribute).array;
	}

	assert.in_delta((await getPosition())[0], 0.5, 0.1);

	noise1.p.offset.x.set(0.723);
	assert.in_delta((await getPosition())[0], 0.87, 0.1);
});

QUnit.test('instanceUpdate simple on point mode', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	plane1.p.size.set([5.12, 5.14]);
	plane1.p.stepSize.set(1.1437);
	const box1 = geo1.createNode('box');
	const instance1 = geo1.createNode('instance');
	createRequiredNodes(instance1);
	instance1.setInput(0, box1);
	instance1.setInput(1, plane1);

	const noise1 = geo1.createNode('noise');
	const instanceUpdate1 = geo1.createNode('instanceUpdate');
	instanceUpdate1.setMode(InstanceUpdateMode.POINTS);

	noise1.setInput(0, plane1);
	instanceUpdate1.setInput(0, instance1);
	instanceUpdate1.setInput(1, noise1);

	async function getPosition() {
		let container = await instanceUpdate1.compute();
		let core_group = container.coreContent()!;
		let objects = core_group.objectsWithGeo();
		let first_object = objects[0];
		let first_geo = first_object.geometry as InstancedBufferGeometry;
		return (first_geo.getAttribute(InstanceAttrib.POSITION) as BufferAttribute).array;
	}

	assert.in_delta((await getPosition())[0], -2.3, 0.1);

	noise1.p.offset.x.set(0.723);
	assert.in_delta((await getPosition())[0], -1.65, 0.1);
});
