import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AttribClass, AttribType} from '../../../../src/core/geometry/Constant';
import {CSS2DObject} from '../../../../src/core/render/CSSRenderers/CSS2DObject';
import {CSSObjectAttribute} from '../../../../src/core/render/CSSRenderers/CSSObjectAttribute';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';
export function findCSS2DObjects(_scene: PolyScene) {
	const threejsScene = _scene.threejsScene();
	const CSSObjects: CSS2DObject[] = [];
	threejsScene.traverse((obj) => {
		if ((obj as CSS2DObject).element) {
			CSSObjects.push(obj as CSS2DObject);
		}
	});
	return CSSObjects;
}
export function testenginenodessopCSS2DObject(qUnit: QUnit) {
	qUnit.test('CSS2DObject simple', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;

		geo1.flags.display.set(false); // cancels geo node displayNodeController while nodes are being created

		const plane1 = geo1.createNode('plane');
		const copy1 = geo1.createNode('copy');
		const attribCreate_id = geo1.createNode('attribCreate');
		const attribCreate_class = geo1.createNode('attribCreate');
		const attribCreate_html = geo1.createNode('attribCreate');
		const CSS2DObject1 = geo1.createNode('CSS2DObject');
		copy1.setInput(0, plane1);
		attribCreate_id.setInput(0, copy1);
		attribCreate_class.setInput(0, attribCreate_id);
		attribCreate_html.setInput(0, attribCreate_class);
		CSS2DObject1.setInput(0, attribCreate_html);
		CSS2DObject1.flags.display.set(true);

		copy1.p.count.set(4);
		const attribCreateNodes = [attribCreate_id, attribCreate_class, attribCreate_html];
		for (const attribCreateNode of attribCreateNodes) {
			attribCreateNode.setAttribClass(AttribClass.OBJECT);
		}
		attribCreate_id.p.name.set(CSSObjectAttribute.ID);
		attribCreate_id.setAttribType(AttribType.STRING);
		attribCreate_id.p.string.set('myId`@ptnum`');
		attribCreate_class.p.name.set(CSSObjectAttribute.CLASS);
		attribCreate_class.setAttribType(AttribType.STRING);
		attribCreate_class.p.string.set('myClass`@objnum*3`');
		attribCreate_html.p.name.set(CSSObjectAttribute.HTML);
		attribCreate_html.setAttribType(AttribType.STRING);
		attribCreate_html.p.string.set(`This is the content \`@objnum*10\` (\`@${CSSObjectAttribute.CLASS}\`)`);

		geo1.flags.display.set(true); // ensures hook is run

		async function CSS2DObjects() {
			await CSS2DObject1.compute();
			await CoreSleep.sleep(50);
			return findCSS2DObjects(scene);
		}

		let objects = await CSS2DObjects();
		assert.equal(objects.length, 4, '4 objects (1)');
		let element = objects[0].element;
		assert.equal(element.id, 'myCSSObject');
		assert.equal(element.className, 'CSS2DObject');

		CSS2DObject1.p.overrideClassName.set(false);
		objects = await CSS2DObjects();
		assert.equal(objects.length, 4, '4 objects (2)');
		assert.equal(objects[0].element.id, 'myCSSObject');
		assert.equal(objects[0].element.className, 'myClass0');
		assert.equal(objects[0].element.innerText, 'default html');
		assert.equal(objects[1].element.id, 'myCSSObject');
		assert.equal(objects[1].element.className, 'myClass3');

		CSS2DObject1.p.overrideId.set(false);
		objects = await CSS2DObjects();
		assert.equal(objects.length, 4, '4 objects (3)');
		assert.equal(objects[0].element.id, 'myId0');
		assert.equal(objects[0].element.className, 'myClass0');
		assert.equal(objects[0].element.innerText, 'default html');
		assert.equal(objects[1].element.id, 'myId1');
		assert.equal(objects[1].element.className, 'myClass3');

		CSS2DObject1.p.overrideHTML.set(false);
		objects = await CSS2DObjects();
		assert.equal(objects.length, 4, '4 objects (4)');
		assert.equal(objects[0].element.id, 'myId0');
		assert.equal(objects[0].element.className, 'myClass0');
		assert.equal(objects[0].element.innerText, 'This is the content 0 (myClass0)');
		assert.equal(objects[1].element.id, 'myId1');
		assert.equal(objects[1].element.className, 'myClass3');
		assert.equal(objects[1].element.innerText, 'This is the content 10 (myClass3)');
	});
}
