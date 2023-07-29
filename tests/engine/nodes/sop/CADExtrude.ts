import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopCADExtrude(qUnit: QUnit) {
qUnit.skip('sop/CADExtrude curve2D', async (assert) => {
	assert.equal(1, 1, 'coverted in CADCircle2D');
});
qUnit.skip('sop/CADExtrude edge', async (assert) => {
	assert.equal(1, 2);
});
qUnit.skip('sop/CADExtrude wire', async (assert) => {
	assert.equal(1, 2);
});
qUnit.skip('sop/CADExtrude face', async (assert) => {
	assert.equal(1, 2);
});
qUnit.skip('sop/CADExtrude shell', async (assert) => {
	assert.equal(1, 2);
});
qUnit.skip('sop/CADExtrude solid', async (assert) => {
	assert.equal(1, 2);
});

}