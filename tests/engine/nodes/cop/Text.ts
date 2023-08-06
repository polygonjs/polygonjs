import type {QUnit} from '../../../helpers/QUnit';

export function testenginenodescopText(qUnit: QUnit) {
	qUnit.test('cop/text simple', async (assert) => {
		const COP = window.COP;

		const text1 = COP.createNode('text');

		const getTexture = async () => {
			const container = await text1.compute();
			const texture = container.texture();
			return texture;
		};
		const uuid = (await getTexture()).uuid;
		assert.ok(uuid);
		assert.notOk(text1.states.error.message());

		text1.p.text.set('TEST2');
		assert.equal((await getTexture()).uuid, uuid, 'same uuid');
		assert.notOk(text1.states.error.message());
	});
}
