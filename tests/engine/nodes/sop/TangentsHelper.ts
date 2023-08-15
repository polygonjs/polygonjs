import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopTangentsHelper(qUnit: QUnit) {
	qUnit.test('sop/tangentsHelper simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const sphere1 = geo1.createNode('sphere');
		const tangentsHelper = geo1.createNode('tangentsHelper');
		tangentsHelper.setInput(0, sphere1);

		let container = await tangentsHelper.compute();
		assert.notOk(container.coreContent());
		assert.equal(tangentsHelper.states.error.message(), "no tangent attribute found on geometry 'sphere1'");

		const tangent = geo1.createNode('tangent');
		tangent.setInput(0, sphere1);
		tangentsHelper.setInput(0, tangent);

		container = await tangentsHelper.compute();
		assert.equal(container.coreContent()!.threejsObjects().length, 2);
		assert.notOk(tangentsHelper.states.error.message());

		tangentsHelper.p.keepInput.set(0);
		container = await tangentsHelper.compute();
		assert.equal(container.coreContent()!.threejsObjects().length, 1);
	});
}
