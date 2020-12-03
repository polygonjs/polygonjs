import {HIERARCHY_MODES, HierarchyMode} from '../../../../src/core/operations/sop/Hierarchy';

QUnit.test('hierarchy simple', async (assert) => {
	const geo1 = window.geo1;

	const file1 = geo1.create_node('file');
	const hierarchy1 = geo1.create_node('hierarchy');
	const hierarchy2 = geo1.create_node('hierarchy');

	hierarchy1.set_input(0, file1);
	hierarchy2.set_input(0, hierarchy1);

	file1.p.url.set('/examples/models/wolf.obj');

	let container = await file1.request_container();
	let core_group = container.core_content()!;
	assert.equal(core_group.objects().length, 1);
	assert.equal(core_group.objects()[0].children.length, 4);

	container = await hierarchy1.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.objects().length, 1);
	assert.equal(core_group.objects()[0].children.length, 1);
	assert.equal(core_group.objects()[0].children[0].children.length, 4);

	hierarchy1.p.levels.set(2);
	container = await hierarchy1.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.objects()[0].children[0].children[0].children.length, 4);

	hierarchy1.p.mode.set(HIERARCHY_MODES.indexOf(HierarchyMode.REMOVE_PARENT));
	hierarchy1.p.levels.set(0);
	container = await hierarchy1.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.objects()[0].children.length, 4);

	hierarchy1.p.levels.set(1);
	container = await hierarchy1.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.objects().length, 4);

	// testing hierarchy2 on more than 1 level
	hierarchy1.p.mode.set(0); // add parent
	hierarchy1.p.levels.set(2);
	hierarchy2.p.mode.set(1); // remove parent
	hierarchy2.p.levels.set(3);
	container = await hierarchy2.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.objects().length, 4);
});
