import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopQuadMirror(qUnit: QUnit) {
	qUnit.test('sop/quadMirror simple', async (assert) => {
		const geo1 = window.geo1;

		const quadPlane1 = geo1.createNode('quadPlane');
		const transform1 = geo1.createNode('transform');
		const quadMirror1 = geo1.createNode('quadMirror');
		transform1.setInput(0, quadPlane1);
		quadMirror1.setInput(0, transform1);

		transform1.p.t.x.set(-2);

		async function getObjects() {
			const container = await quadMirror1.compute();
			const coreGroup = container.coreContent();
			return coreGroup?.quadObjects();
		}

		assert.equal((await getObjects())?.length, 1);
		// quadMirror1.p.preserveInput.set(false);
		// assert.equal((await getObjects())?.length, 1);

		// with hierarchy
		// const hierarchy1 = geo1.createNode('hierarchy');
		// hierarchy1.setInput(0, transform1);
		// quadMirror1.setInput(0, hierarchy1);
		// // mirror1.p.group.set('*');

		// assert.equal((await getObjects())!.length, 1);
		// assert.equal((await getObjects())![0].children?.length, 1);
		// quadMirror1.p.preserveInput.set(true);
		// assert.equal((await getObjects())!.length, 1);
		// assert.equal((await getObjects())![0].children?.length, 2);
	});
}
