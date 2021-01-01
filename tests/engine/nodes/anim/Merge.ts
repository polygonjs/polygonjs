// QUnit.test('anim delete simple', async (assert) => {
// 	const ANIM = window.scene.root.createNode('animations');
// 	const track1 = ANIM.createNode('track');
// 	const track2 = ANIM.createNode('track');
// 	const merge1 = ANIM.createNode('merge');

// 	track1.p.name.set('test1');
// 	track2.p.name.set('test2');
// 	merge1.setInput(0, track1);
// 	merge1.setInput(1, track1);

// 	const container = await merge1.requestContainer();
// 	const core_group = container.coreContent()!;
// 	assert.equal(core_group.tracks.length, 2);
// });
