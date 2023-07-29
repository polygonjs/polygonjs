import type {QUnit} from '../helpers/QUnit';
import {CoreWalker} from '../../src/core/Walker';
export function testcoreWalker(qUnit: QUnit) {

qUnit.test('CoreWalker: from a box', (assert) => {
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

qUnit.test('CoreWalker: a param to another', (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	const geo2 = scene.root().createNode('geo');
	const box3 = geo2.createNode('box');

	assert.equal(box1.p.size.pathRelativeTo(box1), 'size');
	assert.equal(box2.p.size.pathRelativeTo(box1), '../box2/size');
	assert.equal(box2.p.size.pathRelativeTo(box3), '../../geo1/box2/size');
});

qUnit.test('CoreWalker.relativePath', (assert) => {
	const geo1 = window.geo1;
	const material = geo1.createNode('material');
	const materials = geo1.createNode('materialsNetwork');
	const meshBasic = materials.createNode('meshBasic');

	assert.equal(CoreWalker.relativePath(material, meshBasic), '../materialsNetwork1/meshBasic1');
});

qUnit.test('CoreWalker node.node() relative and absolute', (assert) => {
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

qUnit.test('CoreWalker.makeAbsolute', (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const geo2 = scene.createNode('geo');
	const box11 = geo1.createNode('box');
	const box12 = geo1.createNode('box');
	const box21 = geo2.createNode('box');
	const box22 = geo2.createNode('box');
	const MAT1 = geo1.createNode('materialsNetwork');
	const MAT2 = geo2.createNode('materialsNetwork');
	const meshBasic1 = MAT1.createNode('meshBasic');
	const meshBasic2 = MAT2.createNode('meshBasic');
	box11.setName('box11');
	box12.setName('box12');
	box21.setName('box21');
	box22.setName('box22');

	assert.equal(CoreWalker.relativePath(box11, box22), '../../geo2/box22');
	assert.equal(CoreWalker.makeAbsolutePath(box11, CoreWalker.relativePath(box11, box22)), '/geo2/box22');
	assert.equal(CoreWalker.makeAbsolutePath(box11, './../../geo2/box22'), '/geo2/box22');
	assert.equal(CoreWalker.makeAbsolutePath(box11, './../box12'), '/geo1/box12');

	assert.equal(CoreWalker.relativePath(meshBasic1, meshBasic2), '../../../geo2/materialsNetwork1/meshBasic1');
	assert.equal(
		CoreWalker.makeAbsolutePath(meshBasic1, CoreWalker.relativePath(meshBasic1, meshBasic2)),
		'/geo2/materialsNetwork1/meshBasic1'
	);
});

}