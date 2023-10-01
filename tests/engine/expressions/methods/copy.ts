import type {QUnit} from '../../../helpers/QUnit';
import {ThreejsCoreObject} from './../../../../src/core/geometry/modules/three/ThreejsCoreObject';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {coreObjectClassFactory} from '../../../../src/core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../../src/core/geometry/ObjectContent';
export function testengineexpressionsmethodscopy(qUnit: QUnit) {
	qUnit.test('copy can use default value with 1 arg', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const attribCreate1 = geo1.createNode('attribCreate');
		const copy1 = geo1.createNode('copy');

		attribCreate1.setInput(0, box1);
		copy1.setInput(0, attribCreate1);

		attribCreate1.setAttribClass(AttribClass.OBJECT);
		attribCreate1.p.name.set('test');

		attribCreate1.p.value1.set("copy('../copy1')");

		copy1.p.count.set(4);

		let container = await attribCreate1.compute();
		assert.equal(ThreejsCoreObject.attribValue(container.coreContent()!.allObjects()[0], 'test'), 0);

		container = await copy1.compute();
		assert.deepEqual(
			container
				.coreContent()!
				.allObjects()
				.map((o: ObjectContent<CoreObjectType>) => {
					const abstractCoreObject = coreObjectClassFactory(o);
					return abstractCoreObject.attribValue(o, 'test');
				}),
			[0, 1, 2, 3]
		);
	});

	qUnit.test('copy can use default value with 2 args', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const attribCreate1 = geo1.createNode('attribCreate');
		const copy1 = geo1.createNode('copy');

		attribCreate1.setInput(0, box1);
		copy1.setInput(0, attribCreate1);

		attribCreate1.setAttribClass(AttribClass.OBJECT);
		attribCreate1.p.name.set('test');

		attribCreate1.p.value1.set("copy('../copy1', 2)");

		copy1.p.count.set(4);

		let container = await attribCreate1.compute();
		assert.equal(ThreejsCoreObject.attribValue(container.coreContent()!.allObjects()[0], 'test'), 2);

		container = await copy1.compute();
		assert.deepEqual(
			container
				.coreContent()!
				.allObjects()
				.map((o: ObjectContent<CoreObjectType>) => coreObjectClassFactory(o).attribValue(o, 'test')),
			[0, 1, 2, 3]
		);
	});

	qUnit.test('copy can use default value with 3 args', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const attribCreate1 = geo1.createNode('attribCreate');
		const copy1 = geo1.createNode('copy');

		attribCreate1.setInput(0, box1);
		copy1.setInput(0, attribCreate1);

		attribCreate1.setAttribClass(AttribClass.OBJECT);
		attribCreate1.p.name.set('test');
		attribCreate1.p.value1.set("copy('../copy1', 2, 'i')");

		copy1.p.count.set(4);

		let container = await attribCreate1.compute();
		assert.equal(ThreejsCoreObject.attribValue(container.coreContent()!.allObjects()[0], 'test'), 2);

		container = await copy1.compute();
		assert.deepEqual(
			container
				.coreContent()!
				.allObjects()
				.map((o: ObjectContent<CoreObjectType>) => coreObjectClassFactory(o).attribValue(o, 'test')),
			[0, 1, 2, 3]
		);
	});
}
