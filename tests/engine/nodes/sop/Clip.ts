import {ClipSopNode} from '../../../../src/engine/nodes/sop/Clip';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}

function withFile(path: string) {
	const geo1 = window.geo1;
	const fileNode = geo1.createNode('fileGLTF');
	fileNode.p.url.set(_url(path));
	fileNode.p.draco.set(1);

	return {geo1, fileNode};
}

async function _compute(node: ClipSopNode) {
	const container = await node.compute();
	return {pointsCount: container.pointsCount()};
}

QUnit.test('sop/clip simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const clip1 = geo1.createNode('clip');
	clip1.setInput(0, box1);

	function compute() {
		return _compute(clip1);
	}

	assert.equal((await compute()).pointsCount, 42);

	clip1.p.intersectionEdges.set(true);
	clip1.p.keepAbovePlane.set(false);
	clip1.p.keepBelowPlane.set(false);
	assert.equal((await compute()).pointsCount, 16);

	clip1.p.intersectionEdges.set(false);
	clip1.p.keepAbovePlane.set(true);
	clip1.p.keepBelowPlane.set(false);
	assert.equal((await compute()).pointsCount, 42);

	clip1.p.intersectionEdges.set(false);
	clip1.p.keepAbovePlane.set(false);
	clip1.p.keepBelowPlane.set(true);
	assert.equal((await compute()).pointsCount, 42);

	clip1.p.intersectionEdges.set(true);
	clip1.p.keepAbovePlane.set(true);
	clip1.p.keepBelowPlane.set(true);
	assert.equal((await compute()).pointsCount, 100);
});

QUnit.test('sop/clip with hierarchy', async (assert) => {
	const {geo1, fileNode} = withFile('models/resources/threedscans.com/eagle.glb');

	const clip1 = geo1.createNode('clip');
	clip1.setInput(0, fileNode);
	clip1.p.distance.set(0.4);

	function compute() {
		return _compute(clip1);
	}

	assert.equal((await compute()).pointsCount, 353571);

	clip1.p.intersectionEdges.set(true);
	clip1.p.keepAbovePlane.set(false);
	clip1.p.keepBelowPlane.set(false);
	assert.equal((await compute()).pointsCount, 2082);

	clip1.p.intersectionEdges.set(false);
	clip1.p.keepAbovePlane.set(true);
	clip1.p.keepBelowPlane.set(false);
	assert.equal((await compute()).pointsCount, 305979);

	clip1.p.intersectionEdges.set(false);
	clip1.p.keepAbovePlane.set(false);
	clip1.p.keepBelowPlane.set(true);
	assert.equal((await compute()).pointsCount, 353571);

	clip1.p.intersectionEdges.set(true);
	clip1.p.keepAbovePlane.set(true);
	clip1.p.keepBelowPlane.set(true);
	assert.equal((await compute()).pointsCount, 661632);
});
