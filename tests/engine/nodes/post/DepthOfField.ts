import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodespostDepthOfField(qUnit: QUnit) {
qUnit.skip('depth of field works with meshes', async (assert) => {
	assert.equal(1, 2);
});

qUnit.skip(
	'depth of field works with meshes using meshBasicBuilder/meshLambertBuilder/meshPhongBuilder/meshStandardBuilder/meshPhysicalBuilder',
	async (assert) => {
		assert.equal(1, 2);
	}
);

qUnit.skip('depth of field works with lines and points using respective builders', async (assert) => {
	assert.equal(1, 2);
});

}