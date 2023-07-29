import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopCapsule(qUnit: QUnit) {
qUnit.test('capsule simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const capsule1 = geo1.createNode('capsule');

	let container = await capsule1.compute();
	const coreGroup = container.coreContent();
	assert.equal(coreGroup?.pointsCount(), 900);
});

}