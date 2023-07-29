import type {QUnit} from '../../../helpers/QUnit';
import {HierarchySopNode} from './../../../../src/engine/nodes/sop/Hierarchy';
import {Object3D} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {AddChildMode, HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {CorePath} from '../../../../src/core/geometry/CorePath';
export function testenginenodessopHierarchy(qUnit: QUnit) {

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

qUnit.test('sop/hierarchy simple set/remove parent', async (assert) => {
	const geo1 = window.geo1;

	const file1 = geo1.createNode('fileOBJ');
	const hierarchy1 = geo1.createNode('hierarchy');
	const hierarchy2 = geo1.createNode('hierarchy');

	hierarchy1.setInput(0, file1);
	hierarchy2.setInput(0, hierarchy1);

	file1.p.url.set(_url('models/wolf.obj'));

	let container = await file1.compute();
	let core_group = container.coreContent()!;
	assert.equal(core_group.threejsObjects().length, 1, '1 object');
	assert.equal(core_group.threejsObjects()[0].children.length, 4, '4 children');

	container = await hierarchy1.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.threejsObjects().length, 1, '1 object');
	assert.equal(core_group.threejsObjects()[0].children.length, 1);
	assert.equal(core_group.threejsObjects()[0].children[0].children.length, 4);

	hierarchy1.p.levels.set(2);
	container = await hierarchy1.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.threejsObjects()[0].children[0].children[0].children.length, 4);

	hierarchy1.setMode(HierarchyMode.REMOVE_PARENT);
	hierarchy1.p.levels.set(0);
	container = await hierarchy1.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.threejsObjects()[0].children.length, 4);

	hierarchy1.p.levels.set(1);
	container = await hierarchy1.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.threejsObjects().length, 4);

	// testing hierarchy2 on more than 1 level
	hierarchy1.setMode(HierarchyMode.ADD_PARENT); // add parent
	hierarchy1.p.levels.set(2);
	hierarchy2.setMode(HierarchyMode.REMOVE_PARENT); // remove parent
	hierarchy2.p.levels.set(3);
	container = await hierarchy2.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.threejsObjects().length, 4);
});

qUnit.test('sop/hierarchy simple add children', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const merge1 = geo1.createNode('merge');
	transform1.setInput(0, box1);
	merge1.setInput(0, box1);
	merge1.setInput(1, transform1);
	merge1.setCompactMode(false);

	const sphere1 = geo1.createNode('box');
	const transform2 = geo1.createNode('transform');
	const merge2 = geo1.createNode('merge');
	transform2.setInput(0, sphere1);
	merge2.setInput(0, sphere1);
	merge2.setInput(1, transform2);
	merge2.setCompactMode(false);

	const hierarchy1 = geo1.createNode('hierarchy');
	hierarchy1.setInput(0, merge1);

	hierarchy1.setMode(HierarchyMode.ADD_CHILD);
	hierarchy1.setAddChildMode(AddChildMode.ALL_CHILDREN_UNDER_FIRST_PARENT);

	await hierarchy1.compute();
	assert.equal(hierarchy1.states.error.message(), 'input 1 is invalid');

	async function getChildrenCount(): Promise<number[]> {
		const container = await hierarchy1.compute();

		const objects = container.coreContent()!.threejsObjects();
		return objects.map((object: Object3D) => object.children.length);
	}

	hierarchy1.setInput(1, merge2);
	assert.deepEqual(await getChildrenCount(), [2, 0]);
	assert.notOk(hierarchy1.states.error.message());

	hierarchy1.setAddChildMode(AddChildMode.ONE_CHILD_PER_PARENT);
	assert.deepEqual(await getChildrenCount(), [1, 1]);
	hierarchy1.setAddChildMode(AddChildMode.ALL_CHILDREN_UNDER_ALL_PARENTS);
	assert.deepEqual(await getChildrenCount(), [2, 2]);
});

qUnit.test('sop/hierarchy simple add parent', async (assert) => {
	const geo1 = window.geo1;

	async function _objectsList(hierarchyNode: HierarchySopNode) {
		const container = await hierarchyNode.compute();
		const objects = container.coreContent()!.threejsObjects();
		const list: string[] = [];
		for (let object of objects) {
			object.traverse((child: Object3D) => {
				const path = CorePath.objectPath(child);
				list.push(path);
			});
		}
		return list;
	}

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	// const box3 = geo1.createNode('box');

	const hierarchy1 = geo1.createNode('hierarchy');
	hierarchy1.setInput(0, box1);
	hierarchy1.setMode(HierarchyMode.ADD_PARENT);

	const objectsList = () => _objectsList(hierarchy1);

	hierarchy1.p.levels.set(0);
	assert.deepEqual(await objectsList(), ['box1']);

	hierarchy1.p.levels.set(1);
	assert.deepEqual(await objectsList(), ['', '/box1']);

	hierarchy1.p.levels.set(2);
	assert.deepEqual(await objectsList(), ['', '/', '/box1']);

	// with a second input
	hierarchy1.setInput(1, box2);

	hierarchy1.p.levels.set(0);
	assert.deepEqual(await objectsList(), ['box1']);

	hierarchy1.p.levels.set(1);
	assert.deepEqual(await objectsList(), ['box2', 'box2/box1']);

	hierarchy1.p.levels.set(2);
	assert.deepEqual(await objectsList(), ['', '/box2', '/box2/box1']);
});

}