import type {QUnit} from '../../../helpers/QUnit';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {totalPointsCount} from '../../../../src/engine/containers/utils/GeometryContainerUtils';
export function testenginenodessopAnimationCopy(qUnit: QUnit) {
	function _url(path: string) {
		return `${ASSETS_ROOT}${path}`;
	}

	qUnit.test('animation_copy simple', async (assert) => {
		const geo1 = window.geo1;

		const file1 = geo1.createNode('fileGLTF');
		const hierarchy1 = geo1.createNode('hierarchy');
		const animation_copy1 = geo1.createNode('animationCopy');
		// const animation_mixer1 = geo1.createNode('animationMixer');

		hierarchy1.setInput(0, file1);
		animation_copy1.setInput(0, hierarchy1);
		animation_copy1.setInput(1, file1);

		hierarchy1.setMode(HierarchyMode.REMOVE_PARENT); // remove parent
		file1.p.url.set(_url('models/soldier.glb'));

		let container = await animation_copy1.compute();
		assert.equal(totalPointsCount(container), 7434); // I should really do a better test
	});
}
