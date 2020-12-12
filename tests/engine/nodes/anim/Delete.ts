// QUnit.test('anim merge simple', async (assert) => {
// 	const ANIM = window.scene.root.createNode('animations');
// 	const track1 = ANIM.createNode('track');
// 	const track2 = ANIM.createNode('track');
// 	const merge1 = ANIM.createNode('merge');
// 	const delete1 = ANIM.createNode('delete');

// 	track1.p.name.set('test1');
// 	track2.p.name.set('test2');
// 	delete1.p.pattern.set('*2');
// 	merge1.set_input(0, track1);
// 	merge1.set_input(1, track1);
// 	delete1.set_input(0, merge1);

// 	const container = await delete1.request_container();
// 	const core_group = container.core_content()!;
// 	assert.equal(core_group.tracks.length, 1);
// 	assert.equal(core_group.tracks[0].name, 'test1');
// });
