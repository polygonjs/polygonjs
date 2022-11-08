import {Object3D} from 'three';
QUnit.test('sop/actor with objectsMask', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const box3 = geo1.createNode('box');
	const hierarchy1 = geo1.createNode('hierarchy');
	const hierarchy2 = geo1.createNode('hierarchy');
	const actor1 = geo1.createNode('actor');

	hierarchy1.setInput(0, box1);
	hierarchy1.setInput(1, box2);
	hierarchy2.setInput(0, hierarchy1);
	hierarchy2.setInput(1, box3);
	actor1.setInput(0, hierarchy2);

	const actorsManager = window.scene.actorsManager;
	async function _objectNamesWithActor() {
		const container = await actor1.compute();
		const coreGroup = container.coreContent()!;
		const objects = coreGroup.objects();
		const names: string[] = [];

		for (let object of objects) {
			object.traverse((child: Object3D) => {
				if (actorsManager.objectActorNodeIds(child)?.includes(actor1.graphNodeId())) {
					names.push(child.name);
				}
			});
		}
		return names;
	}

	assert.deepEqual(await _objectNamesWithActor(), ['box3']);

	actor1.p.objectsMask.set('*box2');
	assert.deepEqual(await _objectNamesWithActor(), ['box2']);
});
