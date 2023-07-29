import type {QUnit} from '../../../helpers/QUnit';
import {CorePoint} from '../../../../src/core/geometry/Point';
export function testengineexpressionsmethodsopname(qUnit: QUnit) {

qUnit.test('expression opname works', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');
	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.p.name.set('`opname("..")`');
	attribCreate1.p.value1.set(1);
	attribCreate1.setInput(0, line1);

	let container = await attribCreate1.compute();
	assert.deepEqual(
		container
			.coreContent()!
			.points()
			.map((p: CorePoint) => p.attribValue('geo1')),
		[1, 1]
	);

	geo1.setName('myGeo');
	container = await attribCreate1.compute();
	assert.deepEqual(
		container
			.coreContent()!
			.points()
			.map((p: CorePoint) => p.attribValue('myGeo')),
		[1, 1]
	);
});

qUnit.test('expression $OS', async (assert) => {
	const geo1 = window.geo1;

	const perspectiveCamera1 = geo1.createNode('perspectiveCamera');

	async function getName() {
		const container = await perspectiveCamera1.compute();
		const object = container.coreContent()!.allObjects()[0];
		return object.name;
	}

	assert.equal(await getName(), 'perspectiveCamera1');

	perspectiveCamera1.setName('myCam');
	assert.equal(await getName(), 'myCam');
});

}