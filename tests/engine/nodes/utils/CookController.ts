import {AttribClass} from '../../../../src/core/geometry/Constant';
import {coreObjectFactory} from '../../../../src/core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../../src/core/geometry/ObjectContent';

QUnit.test('nodes/cookController bypassed input works as expected when changing node params', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attribCreate1 = geo1.createNode('attribCreate');
	const attribSetAtIndex1 = geo1.createNode('attribSetAtIndex');

	attribCreate1.flags.bypass.set(true);
	attribCreate1.setInput(0, plane1);
	attribSetAtIndex1.setInput(0, attribCreate1);

	await attribSetAtIndex1.compute();
	assert.notOk(attribSetAtIndex1.states.error.active());

	attribSetAtIndex1.p.value1.set(1);
	await attribSetAtIndex1.compute();
	assert.notOk(attribSetAtIndex1.states.error.active());

	attribSetAtIndex1.p.value1.set(2);
	await attribSetAtIndex1.compute();
	assert.notOk(attribSetAtIndex1.states.error.active());
});

QUnit.test('merge is updated correctly if two inputs are updated at the same time', async (assert) => {
	const geo1 = window.geo1;

	const merge1 = geo1.createNode('merge');
	const text1 = geo1.createNode('text');
	const text2 = geo1.createNode('text');
	const attribCreate1 = geo1.createNode('attribCreate');
	const attribCreate2 = geo1.createNode('attribCreate');

	attribCreate1.setInput(0, text1);
	attribCreate2.setInput(0, text2);
	merge1.setInput(0, attribCreate1);
	merge1.setInput(1, attribCreate2);

	const attribCreates = [attribCreate1, attribCreate2];
	let i = 0;
	for (let attribCreate of attribCreates) {
		attribCreate.setAttribClass(AttribClass.OBJECT);
		attribCreate.p.name.set('bla');
		attribCreate.p.value1.set(i);
		i++;
	}

	async function attribValues() {
		const container = await merge1.compute();
		const values = container
			.coreContent()
			?.allObjects()
			.map((o: ObjectContent<CoreObjectType>) => coreObjectFactory(o).attribValue(o, 'bla') as number);
		return values;
	}
	function setValues(value0: number, value1: number) {
		attribCreate1.p.value1.set(value0);
		attribCreate2.p.value1.set(value1);
	}

	assert.deepEqual(await attribValues(), [0, 1]);

	setValues(2, 3);
	assert.deepEqual(await attribValues(), [2, 3]);

	setValues(4, 21);
	assert.deepEqual(await attribValues(), [4, 21]);
});
