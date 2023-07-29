import type {QUnit} from '../../../helpers/QUnit';
export function testengineexpressionsmethodsstrCharsCount(qUnit: QUnit) {
qUnit.test('expression strCharsCount simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const sizex_param = plane1.p.size.x;

	sizex_param.set('strCharsCount( "test test" )');
	await sizex_param.compute();
	assert.equal(sizex_param.value, 9);

	sizex_param.set('strCharsCount( "test test12" )');
	await sizex_param.compute();
	assert.equal(sizex_param.value, 11);

	// create a text and apply expression to it's text attribute
	const text1 = geo1.createNode('text');
	text1.setName('text1');
	assert.equal(text1.name(), 'text1');
	sizex_param.set('strCharsCount( ch("../text1/text") )');

	text1.p.text.set('demo');
	await sizex_param.compute();
	assert.equal(sizex_param.value, 4);

	text1.p.text.set('a much longer text');
	await sizex_param.compute();
	assert.equal(sizex_param.value, 18);
});

}