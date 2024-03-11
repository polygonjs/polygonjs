import {Mesh, MeshBasicMaterial} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
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

	qUnit.test('cop/text recreates a texture correctly when the resolution changes', async (assert) => {
		const COP = window.COP;
		const MAT = window.MAT;
		const geo1 = window.geo1;

		const text1 = COP.createNode('text');
		const meshBasic1 = MAT.createNode('meshBasic');
		meshBasic1.p.useMap.set(true);
		meshBasic1.p.map.setNode(text1);

		const box1 = geo1.createNode('box');
		const material1 = geo1.createNode('material');
		material1.setInput(0, box1);
		material1.p.material.setNode(meshBasic1);
		material1.flags.display.set(true);
		await CoreSleep.sleep(100);

		const container1 = await material1.compute();
		const object1 = container1.coreContent()?.threejsObjects()[0];
		assert.ok(object1, 'object1 ok');
		const texture1 = ((object1 as Mesh).material as MeshBasicMaterial).map;
		assert.ok(texture1, 'texture1 ok');
		assert.equal(texture1?.image.width, 256, '256x');
		assert.equal(texture1?.image.height, 256, '256y');

		text1.p.resolution.set([64, 256]);
		await text1.compute();
		await CoreSleep.sleep(100);

		const texture2 = ((object1 as Mesh).material as MeshBasicMaterial).map;
		assert.ok(texture2, 'texture1 ok');
		assert.equal(texture2?.image.width, 64, '64x');
		assert.equal(texture2?.image.height, 256, '256y');
	});
}
