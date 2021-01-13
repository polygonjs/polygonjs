QUnit.test('cache static', async (assert) => {
	let container;
	const geo1 = window.geo1;
	const sphere1 = geo1.createNode('sphere');
	sphere1.p.resolution.set([8, 6]);
	const plane1 = geo1.createNode('plane');
	const cache1 = geo1.createNode('cache');

	cache1.setInput(0, sphere1);
	container = await cache1.requestContainer();
	let core_group = container.coreContent()!;
	assert.equal(core_group.pointsCount(), 63);
	// let json = core_group.objects().map((o) => o.toJSON());
	// assert.equal(JSON.stringify(json).length, 8109);

	cache1.setInput(0, plane1);
	container = await cache1.requestContainer();
	core_group = container.coreContent()!;
	assert.equal(core_group.pointsCount(), 63); // still same points_count
	// json = core_group.objects().map((o) => o.toJSON());
	// assert.equal(JSON.stringify(json).length, 8109); // still same length

	cache1.p.reset.pressButton();
	container = await cache1.requestContainer();
	core_group = container.coreContent()!;
	assert.equal(core_group.pointsCount(), 4); // not same points_count anymore
	// json = core_group.objects().map((o) => o.toJSON());
	// assert.equal(JSON.stringify(json).length, 1345); // not same length anymore
});

// box1 = geo1.createNode('box')
// transform1 = geo1.createNode('transform')
// transform1.setInput(0, box1)
// transform1.param('ty').set_expression("$F")

// cache1 = geo1.createNode('cache')
// cache1.setInput(0, transform1)
// cache1.param('animated').set(0)
// cache1._clear_cache()

// cache1.requestContainer (container)=>
// 	group = container.group()

// 	assert.equal cache1.cooks_count(), 1
// 	assert.equal box1.cooks_count(), 1
// 	assert.equal transform1.cooks_count(), 1

// 	scene.increment_frame()
// 	assert !box1.isDirty()()
// 	assert transform1.isDirty()()
// 	assert !cache1.isDirty()()

// 	cache1.requestContainer (container)=>
// 		group = container.group()

// 		assert.equal cache1.cooks_count(), 1
// 		assert.equal box1.cooks_count(), 1
// 		assert.equal transform1.cooks_count(), 1

// 		assert !box1.isDirty()()
// 		assert transform1.isDirty()()

// 		done()

QUnit.skip('cache animated', () => {});

// box1 = geo1.createNode('box')
// transform1 = geo1.createNode('transform')
// transform1.setInput(0, box1)
// transform1.param('ty').set_expression("$F")

// cache1 = geo1.createNode('cache')
// cache1.setInput(0, transform1)
// cache1.param('animated').set(1)
// cache1._clear_cache()

// cache1.requestContainer (container)=>
// 	group = container.group()

// 	assert.equal cache1.cooks_count(), 1
// 	assert.equal box1.cooks_count(), 1
// 	assert.equal transform1.cooks_count(), 1

// 	scene.increment_frame()
// 	assert !box1.isDirty()()
// 	assert transform1.isDirty()()
// 	assert cache1.isDirty()()

// 	cache1.requestContainer (container)=>
// 		group = container.group()

// 		assert.equal cache1.cooks_count(), 2
// 		assert.equal box1.cooks_count(), 1
// 		assert.equal transform1.cooks_count(), 2

// 		assert !box1.isDirty()()
// 		assert !transform1.isDirty()()

// 		scene.setFrame( scene.frame()-1 )
// 		assert !box1.isDirty()()
// 		assert transform1.isDirty()()
// 		assert cache1.isDirty()()

// 		cache1.requestContainer (container)=>
// 			group = container.group()

// 			assert.equal cache1.cooks_count(), 3
// 			assert.equal box1.cooks_count(), 1
// 			assert.equal transform1.cooks_count(), 2

// 			assert !box1.isDirty()()
// 			assert transform1.isDirty()()
// 			assert !cache1.isDirty()()

// 			done()
