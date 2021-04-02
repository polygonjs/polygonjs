import {CoreWalker} from '../../src/core/Walker';

QUnit.test('walker from a box', (assert) => {
	const scene = window.scene;
	const box1 = window.geo1.createNode('box');

	assert.equal(CoreWalker.findNode(box1, '..'), window.geo1);
	assert.equal(CoreWalker.findNode(box1, '.'), box1);
	assert.equal(CoreWalker.findNode(box1, './'), box1);
	assert.equal(CoreWalker.findNode(box1, '/geo1'), window.geo1);
	// assert.equal Core.Walker.findNode(box1, '/'), box1.root # not sure why that doesn't work, but that's not needed
	assert.notOk(CoreWalker.findNode(box1, 'test'));
	assert.notOk(CoreWalker.findNode(box1, '/test'));
	assert.notEqual(CoreWalker.findNode(box1, '/size'), box1.p.size);

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

	assert.equal(box1.p.size.pathRelativeTo(box1), 'size');
	assert.equal(box2.p.size.pathRelativeTo(box1), '../box2/size');
	assert.equal(box2.p.size.pathRelativeTo(box3), '../../geo1/box2/size');
});

QUnit.test('CoreWalker.relativePath', (assert) => {
	const geo1 = window.geo1;
	const material = geo1.createNode('material');
	const materials = geo1.createNode('materialsNetwork');
	const meshBasic = materials.createNode('meshBasic');

	assert.equal(CoreWalker.relativePath(material, meshBasic), '../materialsNetwork1/meshBasic1');
});

QUnit.test('node.node() relative and absolute', (assert) => {
	const geo1 = window.geo1;
	const material = geo1.createNode('material');

	const root = window.scene.root();
	const geo2 = root.createNode('geo');
	assert.equal(geo2.node('.')?.graphNodeId(), geo2.graphNodeId());
	assert.equal(geo2.node('..')?.graphNodeId(), root.graphNodeId());
	assert.equal(geo2.node('../')?.graphNodeId(), root.graphNodeId());
	assert.equal(geo2.node('../geo1')?.graphNodeId(), geo1.graphNodeId());
	assert.equal(geo2.node('/')?.graphNodeId(), root.graphNodeId());
	assert.equal(geo2.node('/geo1')?.graphNodeId(), geo1.graphNodeId());
	assert.equal(geo2.node('/geo1/material1')?.graphNodeId(), material.graphNodeId());
});
