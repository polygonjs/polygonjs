import type {ObjectContent, CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopDeleteByName(qUnit: QUnit) {
	qUnit.test('sop/deleteByName simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const box1 = geo1.createNode('box');
		const box2 = geo1.createNode('box');
		const sphere1 = geo1.createNode('sphere');
		const merge1 = geo1.createNode('merge');
		const deleteByName1 = geo1.createNode('deleteByName');

		merge1.setInput(0, box1);
		merge1.setInput(1, box2);
		deleteByName1.setInput(0, merge1);

		async function compute() {
			const container = await deleteByName1.compute();
			const coreGroup = container.coreContent()!;
			const objectNames = coreGroup.allObjects().map((o: ObjectContent<CoreObjectType>) => o.name) || [];
			return {objectNames};
		}

		assert.deepEqual((await compute()).objectNames, [], 'no objects');

		deleteByName1.p.invert.set(1);
		assert.deepEqual((await compute()).objectNames, ['box1', 'box2'], '2 objects');

		deleteByName1.p.invert.set(0);
		deleteByName1.p.group.set('box1');
		assert.deepEqual((await compute()).objectNames, ['box2']);

		deleteByName1.p.invert.set(1);
		assert.deepEqual((await compute()).objectNames, ['box1']);

		deleteByName1.p.invert.set(0);
		deleteByName1.p.group.set('box*');
		assert.deepEqual((await compute()).objectNames, [], 'box*');

		merge1.setInput(2, sphere1);
		assert.deepEqual((await compute()).objectNames, ['sphere1'], 'box*, with sphere');

		deleteByName1.p.group.set('*1');
		assert.deepEqual((await compute()).objectNames, ['box2'], '*1');
	});
}
