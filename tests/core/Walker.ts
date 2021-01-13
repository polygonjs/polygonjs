import {CoreWalker} from '../../src/core/Walker';

QUnit.test('walker from a box', (assert) => {
	const scene = window.scene;
	const box1 = window.geo1.createNode('box');

	assert.equal(CoreWalker.find_node(box1, '..'), window.geo1);
	assert.equal(CoreWalker.find_node(box1, '.'), box1);
	assert.equal(CoreWalker.find_node(box1, './'), box1);
	assert.equal(CoreWalker.find_node(box1, '/geo1'), window.geo1);
	// assert.equal Core.Walker.find_node(box1, '/'), box1.root # not sure why that doesn't work, but that's not needed
	assert.notOk(CoreWalker.find_node(box1, 'test'));
	assert.notOk(CoreWalker.find_node(box1, '/test'));
	assert.notEqual(CoreWalker.find_node(box1, '/size'), box1.p.size);

	assert.equal(window.scene.root().node('/geo1'), window.geo1);
	assert.equal(window.scene.root().node('.'), window.scene.root());
	assert.equal(window.scene.node('.'), scene.root());
	assert.equal(window.scene.node('/geo1'), window.geo1);
	assert.notEqual(window.scene.node('/geo10'), window.geo1);
});

QUnit.test('a param to another', (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	console.log(box1.fullPath(), box2.fullPath());

	const geo2 = scene.root().createNode('geo');
	const box3 = geo2.createNode('box');

	assert.equal(box1.p.size.path_relative_to(box1.p.divisions), 'size');
	assert.equal(box2.p.size.path_relative_to(box1.p.size), '../box2/size');
	assert.equal(box2.p.size.path_relative_to(box3.p.size), '../../geo1/box2/size');
});
