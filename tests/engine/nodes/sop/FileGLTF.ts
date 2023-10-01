import type {QUnit} from '../../../helpers/QUnit';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {Poly} from '../../../../src/engine/Poly';
import {withPlayerMode} from '../../../helpers/PlayerMode';
import {totalPointsCount} from '../../../../src/engine/containers/utils/GeometryContainerUtils';
export function testenginenodessopFileGLTF(qUnit: QUnit) {
	function _url(path: string) {
		return `${ASSETS_ROOT}${path}`;
	}

	async function withFile(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileGLTF');
		fileNode.p.url.set(_url(path));
		fileNode.p.draco.set(1);

		const container = await fileNode.compute();
		return {container, fileNode};
	}

	async function withFileAndHierarchy(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileGLTF');
		fileNode.p.url.set(_url(path));
		fileNode.p.draco.set(1);

		const hierarchyNode = geo1.createNode('hierarchy');
		hierarchyNode.setMode(HierarchyMode.REMOVE_PARENT);
		hierarchyNode.setInput(0, fileNode);

		const container = await hierarchyNode.compute();
		return {container, fileNode, hierarchyNode};
	}

	qUnit.test('SOP fileGLTF glb stork', async (assert) => {
		const {container} = await withFile('models/stork.glb');
		assert.equal(totalPointsCount(container), 358);
	});
	qUnit.test('SOP fileGLTF glb soldier', async (assert) => {
		const {container} = await withFile('models/soldier.glb');
		assert.equal(totalPointsCount(container), 7434);
	});
	qUnit.test('SOP fileGLTF glb json', async (assert) => {
		const {container} = await withFile('models/parrot.glb');
		assert.equal(totalPointsCount(container), 497);
	});
	qUnit.test('SOP fileGLTF glb horse', async (assert) => {
		const {container} = await withFile('models/horse.glb');
		assert.equal(totalPointsCount(container), 796);
	});
	qUnit.test('SOP fileGLTF glb flamingo', async (assert) => {
		const {container} = await withFile('models/flamingo.glb');
		assert.equal(totalPointsCount(container), 337);
	});
	qUnit.test('SOP fileGLTF z3 glb with draco', async (assert) => {
		const data1 = await withFile('models/z3.glb');
		assert.equal(data1.container.coreContent()!.pointsCount(), 0);
		const data2 = await withFileAndHierarchy('models/z3.glb');
		assert.equal(data2.container.coreContent()!.pointsCount(), 498800);
	});

	qUnit.test('SOP fileGLTF can load multiple glb one after the other', async (assert) => {
		Poly.blobs.clear();
		await withPlayerMode(true, async () => {
			assert.ok(Poly.playerMode());
			const data1 = await withFileAndHierarchy('models/resources/threedscans.com/jenner.glb');
			const data2 = await withFileAndHierarchy('models/resources/threedscans.com/eagle.glb');
			const data3 = await withFileAndHierarchy('models/resources/threedscans.com/theodoric_the_great.glb');

			assert.notOk(data1.hierarchyNode.states.error.active());
			assert.notOk(data2.hierarchyNode.states.error.active());
			assert.notOk(data3.hierarchyNode.states.error.active());

			assert.equal(data1.container.coreContent()!.pointsCount(), 153233);
			assert.equal(data2.container.coreContent()!.pointsCount(), 108882);
			assert.equal(data3.container.coreContent()!.pointsCount(), 283248);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/eagle.glb?t=2'));
			let container = await data2.hierarchyNode.compute();
			assert.equal(container.coreContent()!.pointsCount(), 108882);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb'));
			container = await data2.hierarchyNode.compute();
			assert.equal(container.coreContent()!.pointsCount(), 153233);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb?t=3'));
			container = await data2.hierarchyNode.compute();
			assert.equal(container.coreContent()!.pointsCount(), 153233);
		});
	});

	qUnit.test('SOP fileGLTF can load multiple glb in parallel', async (assert) => {
		Poly.blobs.clear();
		await withPlayerMode(true, async () => {
			assert.ok(Poly.playerMode());
			const promise1 = withFileAndHierarchy('models/resources/threedscans.com/jenner.glb');
			const promise2 = withFileAndHierarchy('models/resources/threedscans.com/eagle.glb');
			const promise3 = withFileAndHierarchy('models/resources/threedscans.com/theodoric_the_great.glb');
			const responses = await Promise.all([promise1, promise2, promise3]);
			const data1 = responses[0];
			const data2 = responses[1];
			const data3 = responses[2];

			assert.notOk(data1.hierarchyNode.states.error.active());
			assert.notOk(data2.hierarchyNode.states.error.active());
			assert.notOk(data3.hierarchyNode.states.error.active());

			assert.equal(data1.container.coreContent()!.pointsCount(), 153233);
			assert.equal(data2.container.coreContent()!.pointsCount(), 108882);
			assert.equal(data3.container.coreContent()!.pointsCount(), 283248);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/eagle.glb?t=2'));
			let container = await data2.hierarchyNode.compute();
			assert.equal(container.coreContent()!.pointsCount(), 108882);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb'));
			container = await data2.hierarchyNode.compute();
			assert.equal(container.coreContent()!.pointsCount(), 153233);

			data2.fileNode.p.url.set(_url('models/resources/threedscans.com/jenner.glb?t=3'));
			container = await data2.hierarchyNode.compute();
			assert.equal(container.coreContent()!.pointsCount(), 153233);
		});
	});
}
