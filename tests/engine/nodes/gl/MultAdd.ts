import {CoreType} from '../../../../src/core/Type';

QUnit.test('gl multAdd default values', async (assert) => {
	const MAT = window.MAT;
	const materialBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	materialBasicBuilder1.createNode('output');
	materialBasicBuilder1.createNode('globals');
	assert.equal(materialBasicBuilder1.children().length, 2);

	const multAdd1 = materialBasicBuilder1.createNode('multAdd');

	assert.equal(multAdd1.pv.value, 0);
	assert.equal(multAdd1.pv.preAdd, 0);
	assert.equal(multAdd1.pv.mult, 1);
	assert.equal(multAdd1.pv.postAdd, 0);
});

QUnit.test('gl multAdd default values are converted from float to bool to float', async (assert) => {
	const MAT = window.MAT;
	const materialBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	materialBasicBuilder1.createNode('output');
	materialBasicBuilder1.createNode('globals');
	assert.equal(materialBasicBuilder1.children().length, 2);

	const multAdd1 = materialBasicBuilder1.createNode('multAdd');

	assert.ok(!CoreType.isBoolean(multAdd1.pv.value));
	assert.equal(multAdd1.pv.value, 0);
	assert.equal(multAdd1.pv.preAdd, 0);
	assert.equal(multAdd1.pv.mult, 1);
	assert.equal(multAdd1.pv.postAdd, 0);

	const compare1 = materialBasicBuilder1.createNode('compare');
	multAdd1.setInput(0, compare1);

	assert.ok(!CoreType.isBoolean(multAdd1.pv.value));

	const constant1 = materialBasicBuilder1.createNode('constant');
	multAdd1.setInput(0, constant1);

	assert.ok(!CoreType.isBoolean(multAdd1.pv.value));
});
