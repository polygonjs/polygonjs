import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopShortestPath(qUnit: QUnit) {
	qUnit.test('sop/shortestPath simple', async (assert) => {
		const geo1 = window.geo1;
		geo1.flags.display.set(false);

		const sphere1 = geo1.createNode('sphere');
		const shortestPaths1 = geo1.createNode('shortestPath');
		shortestPaths1.setInput(0, sphere1);

		const compute = async () => {
			const container = await shortestPaths1.compute();
			const pointsCount = container.pointsCount();
			return {
				pointsCount,
			};
		};

		assert.equal((await compute()).pointsCount, 3);

		shortestPaths1.p.pt1.set(12);
		assert.equal((await compute()).pointsCount, 14);

		const fuse1 = geo1.createNode('fuse');
		fuse1.p.dist.set(0.056);
		fuse1.setInput(0, sphere1);
		shortestPaths1.setInput(0, fuse1);
		assert.equal((await compute()).pointsCount, 2);

		shortestPaths1.p.pt1.set(33);
		shortestPaths1.p.pt1.set(200);
		assert.equal((await compute()).pointsCount, 9);

		shortestPaths1.p.pt1.set(27);
		shortestPaths1.p.pt1.set(437);
		assert.equal((await compute()).pointsCount, 17);
	});
}
