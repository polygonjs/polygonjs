import type {QUnit} from '../../../helpers/QUnit';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
export function testenginenodessopFileVOX(qUnit: QUnit) {
	function _url(path: string) {
		return `${ASSETS_ROOT}${path}`;
	}

	async function withFileVOX(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('fileVOX');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}

	qUnit.test('sop/fileVOX monu10', async (assert) => {
		const {container} = await withFileVOX('models/vox/monu10.vox');
		assert.equal(container.pointsCount(), 301584);

		const objects1 = container.coreContent()?.threejsObjects()!;
		assert.equal(objects1?.length, 1);
	});

	qUnit.test('sop/fileVOX teapot', async (assert) => {
		const {container} = await withFileVOX('models/vox/teapot.vox');
		assert.equal(container.pointsCount(), 335784);

		const objects1 = container.coreContent()?.threejsObjects()!;
		assert.equal(objects1?.length, 1);
	});

	qUnit.test('sop/fileVOX menger', async (assert) => {
		const {container} = await withFileVOX('models/vox/menger.vox');
		assert.equal(container.pointsCount(), 2018304);

		const objects1 = container.coreContent()?.threejsObjects()!;
		assert.equal(objects1?.length, 1);
	});
}
