QUnit.test('cone simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const cone1 = geo1.createNode('cone');

	let container = await cone1.request_container();
	const core_group = container.core_content();
	const geometry = core_group?.objects_with_geo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 153);
});
