QUnit.test('cache static', async (assert) => {
	let container;
	const geo1 = window.geo1;
	const sphere1 = geo1.create_node('sphere');
	const plane1 = geo1.create_node('plane');
	const cache1 = geo1.create_node('cache');

	cache1.set_input(0, sphere1);
	container = await cache1.request_container();
	let core_group = container.core_content()!;
	assert.equal(core_group.points_count(), 63);
	// let json = core_group.objects().map((o) => o.toJSON());
	// assert.equal(JSON.stringify(json).length, 8109);

	cache1.set_input(0, plane1);
	container = await cache1.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.points_count(), 63); // still same points_count
	// json = core_group.objects().map((o) => o.toJSON());
	// assert.equal(JSON.stringify(json).length, 8109); // still same length

	cache1.p.reset.press_button();
	container = await cache1.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.points_count(), 4); // not same points_count anymore
	// json = core_group.objects().map((o) => o.toJSON());
	// assert.equal(JSON.stringify(json).length, 1345); // not same length anymore
});

// box1 = geo1.create_node('box')
// transform1 = geo1.create_node('transform')
// transform1.set_input(0, box1)
// transform1.param('ty').set_expression("$F")

// cache1 = geo1.create_node('cache')
// cache1.set_input(0, transform1)
// cache1.param('animated').set(0)
// cache1._clear_cache()

// cache1.request_container (container)=>
// 	group = container.group()

// 	assert.equal cache1.cooks_count(), 1
// 	assert.equal box1.cooks_count(), 1
// 	assert.equal transform1.cooks_count(), 1

// 	scene.increment_frame()
// 	assert !box1.is_dirty()
// 	assert transform1.is_dirty()
// 	assert !cache1.is_dirty()

// 	cache1.request_container (container)=>
// 		group = container.group()

// 		assert.equal cache1.cooks_count(), 1
// 		assert.equal box1.cooks_count(), 1
// 		assert.equal transform1.cooks_count(), 1

// 		assert !box1.is_dirty()
// 		assert transform1.is_dirty()

// 		done()

QUnit.skip('cache animated', () => {});

// box1 = geo1.create_node('box')
// transform1 = geo1.create_node('transform')
// transform1.set_input(0, box1)
// transform1.param('ty').set_expression("$F")

// cache1 = geo1.create_node('cache')
// cache1.set_input(0, transform1)
// cache1.param('animated').set(1)
// cache1._clear_cache()

// cache1.request_container (container)=>
// 	group = container.group()

// 	assert.equal cache1.cooks_count(), 1
// 	assert.equal box1.cooks_count(), 1
// 	assert.equal transform1.cooks_count(), 1

// 	scene.increment_frame()
// 	assert !box1.is_dirty()
// 	assert transform1.is_dirty()
// 	assert cache1.is_dirty()

// 	cache1.request_container (container)=>
// 		group = container.group()

// 		assert.equal cache1.cooks_count(), 2
// 		assert.equal box1.cooks_count(), 1
// 		assert.equal transform1.cooks_count(), 2

// 		assert !box1.is_dirty()
// 		assert !transform1.is_dirty()

// 		scene.set_frame( scene.frame()-1 )
// 		assert !box1.is_dirty()
// 		assert transform1.is_dirty()
// 		assert cache1.is_dirty()

// 		cache1.request_container (container)=>
// 			group = container.group()

// 			assert.equal cache1.cooks_count(), 3
// 			assert.equal box1.cooks_count(), 1
// 			assert.equal transform1.cooks_count(), 2

// 			assert !box1.is_dirty()
// 			assert transform1.is_dirty()
// 			assert !cache1.is_dirty()

// 			done()
