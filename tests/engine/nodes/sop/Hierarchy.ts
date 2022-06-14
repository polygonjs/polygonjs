import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

QUnit.test('hierarchy simple', async (assert) => {
	const geo1 = window.geo1;

	const file1 = geo1.createNode('fileOBJ');
	const hierarchy1 = geo1.createNode('hierarchy');
	const hierarchy2 = geo1.createNode('hierarchy');

	hierarchy1.setInput(0, file1);
	hierarchy2.setInput(0, hierarchy1);

	file1.p.url.set(_url('models/wolf.obj'));

	let container = await file1.compute();
	let core_group = container.coreContent()!;
	assert.equal(core_group.objects().length, 1);
	assert.equal(core_group.objects()[0].children.length, 4);

	container = await hierarchy1.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.objects().length, 1);
	assert.equal(core_group.objects()[0].children.length, 1);
	assert.equal(core_group.objects()[0].children[0].children.length, 4);

	hierarchy1.p.levels.set(2);
	container = await hierarchy1.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.objects()[0].children[0].children[0].children.length, 4);

	hierarchy1.setMode(HierarchyMode.REMOVE_PARENT);
	hierarchy1.p.levels.set(0);
	container = await hierarchy1.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.objects()[0].children.length, 4);

	hierarchy1.p.levels.set(1);
	container = await hierarchy1.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.objects().length, 4);

	// testing hierarchy2 on more than 1 level
	hierarchy1.setMode(HierarchyMode.ADD_PARENT); // add parent
	hierarchy1.p.levels.set(2);
	hierarchy2.setMode(HierarchyMode.REMOVE_PARENT); // remove parent
	hierarchy2.p.levels.set(3);
	container = await hierarchy2.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.objects().length, 4);
});
