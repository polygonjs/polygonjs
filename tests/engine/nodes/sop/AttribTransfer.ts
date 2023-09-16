import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute} from 'three';
export function testenginenodessopAttribTransfer(qUnit: QUnit) {
	qUnit.test('sop/attribTransfer simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		plane1.p.direction.set([0, 1, 0]);
		const add1 = geo1.createNode('add');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribCreate2 = geo1.createNode('attribCreate');
		const attribTransfer1 = geo1.createNode('attribTransfer');

		attribCreate1.setInput(0, plane1);
		attribCreate2.setInput(0, add1);
		attribTransfer1.setInput(0, attribCreate1);
		attribTransfer1.setInput(1, attribCreate2);

		add1.p.position.set([0.5, 0, 0.5]);
		attribCreate1.p.name.set('test');
		attribCreate2.p.name.set('test');
		attribCreate2.p.value1.set(1);
		attribTransfer1.p.name.set('test');

		let container, core_group, array;
		container = await attribTransfer1.compute();
		core_group = container.coreContent()!;
		array = (core_group.threejsObjectsWithGeo()[0].geometry.getAttribute('test') as BufferAttribute).array;
		assert.deepEqual(Array.from(array), [0, 1, 1, 1]);

		// attrib_transfer1.p.distance_threshold.set(0.5);
		// container = await attrib_transfer1.compute();
		// core_group = container.coreContent()!;
		// array = core_group.objects()[0].geometry.getAttribute('test').array;
		// assert.deepEqual(Array.from(array), [0, 0, 0, 1]);
	});

	qUnit.test('sop/attribTransfer quad', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');
		const add1 = geo1.createNode('add');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribCreate2 = geo1.createNode('attribCreate');
		const attribTransfer1 = geo1.createNode('attribTransfer');

		attribCreate1.setInput(0, quadPlane1);
		attribCreate2.setInput(0, add1);
		attribTransfer1.setInput(0, attribCreate1);
		attribTransfer1.setInput(1, attribCreate2);

		add1.p.position.set([0.5, 0, 0.5]);
		attribCreate1.p.name.set('test');
		attribCreate2.p.name.set('test');
		attribCreate2.p.value1.set(1);
		attribTransfer1.p.name.set('test');

		let container, core_group, array;
		container = await attribTransfer1.compute();
		core_group = container.coreContent()!;
		array = (core_group.quadObjects()![0].geometry.attributes['test'] as BufferAttribute).array;
		assert.deepEqual(Array.from(array), [0, 1, 1, 1]);

		// attrib_transfer1.p.distance_threshold.set(0.5);
		// container = await attrib_transfer1.compute();
		// core_group = container.coreContent()!;
		// array = core_group.objects()[0].geometry.getAttribute('test').array;
		// assert.deepEqual(Array.from(array), [0, 0, 0, 1]);
	});
}
