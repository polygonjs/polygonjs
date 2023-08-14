import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopMirror(qUnit: QUnit) {
	qUnit.test('sop/mirror simple', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');
		const mirror1 = geo1.createNode('mirror');
		transform1.setInput(0, box1);
		mirror1.setInput(0, transform1);

		transform1.p.t.x.set(-2);

		async function getObjects() {
			const container = await mirror1.compute();
			const coreGroup = container.coreContent();
			return coreGroup?.threejsObjects();
		}

		assert.equal((await getObjects())?.length, 2);
		mirror1.p.preserveInput.set(false);
		assert.equal((await getObjects())?.length, 1);

		// with hierarchy
		const hierarchy1 = geo1.createNode('hierarchy');
		hierarchy1.setInput(0, transform1);
		mirror1.setInput(0, hierarchy1);
		// mirror1.p.group.set('*');

		assert.equal((await getObjects())!.length, 1);
		assert.equal((await getObjects())![0].children?.length, 1);
		mirror1.p.preserveInput.set(true);
		assert.equal((await getObjects())!.length, 1);
		assert.equal((await getObjects())![0].children?.length, 2);
	});
}
