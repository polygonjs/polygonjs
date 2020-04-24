QUnit.test('anim delete simple', async (assert) => {
	const ANIM = window.scene.root.create_node('animations');
	const track1 = ANIM.create_node('track');
	const track2 = ANIM.create_node('track');
	const merge1 = ANIM.create_node('merge');

	track1.p.name.set('test1');
	track2.p.name.set('test2');
	merge1.set_input(0, track1);
	merge1.set_input(1, track1);

	const container = await merge1.request_container();
	const core_group = container.core_content()!;
	assert.equal(core_group.tracks.length, 2);
});
