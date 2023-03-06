import {AttribType} from '../../../../src/core/geometry/Constant';
import {CSS2DObject} from '../../../../src/modules/three/examples/jsm/renderers/CSS2DRenderer';

QUnit.test('CSS3DObject simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const plane1 = geo1.createNode('plane');
	const attribCreate_id = geo1.createNode('attribCreate');
	const attribCreate_class = geo1.createNode('attribCreate');
	const attribCreate_html = geo1.createNode('attribCreate');
	const CSS3DObject1 = geo1.createNode('CSS3DObject');
	attribCreate_id.setInput(0, plane1);
	attribCreate_class.setInput(0, attribCreate_id);
	attribCreate_html.setInput(0, attribCreate_class);
	CSS3DObject1.setInput(0, attribCreate_html);

	attribCreate_id.p.name.set('id');
	attribCreate_id.setAttribType(AttribType.STRING);
	attribCreate_id.p.string.set('myId`@ptnum`');
	attribCreate_class.p.name.set('class');
	attribCreate_class.setAttribType(AttribType.STRING);
	attribCreate_class.p.string.set('myClass`@ptnum*3`');
	attribCreate_html.p.name.set('html');
	attribCreate_html.setAttribType(AttribType.STRING);
	attribCreate_html.p.string.set('This is the content `@ptnum*10` (`@class`)');

	async function CSS2DObjects() {
		let container = await CSS3DObject1.compute();
		const core_group = container.coreContent()!;
		const objects = core_group?.threejsObjects() as CSS2DObject[];
		return objects;
	}
	let objects = await CSS2DObjects();
	assert.equal(objects.length, 4);
	let element = objects[0].element;
	assert.equal(element.id, 'myCSSObject');
	assert.equal(element.className, 'CSS3DObject');

	CSS3DObject1.p.useClassAttrib.set(true);
	objects = await CSS2DObjects();
	assert.equal(objects[0].scale.x, 0.1);
	assert.equal(objects.length, 4);
	assert.equal(objects[0].element.id, 'myCSSObject');
	assert.equal(objects[0].element.className, 'myClass0');
	assert.equal(objects[0].element.innerText, 'default html');
	assert.equal(objects[1].element.id, 'myCSSObject');
	assert.equal(objects[1].element.className, 'myClass3');

	CSS3DObject1.p.useIdAttrib.set(true);
	objects = await CSS2DObjects();
	assert.equal(objects.length, 4);
	assert.equal(objects[0].element.id, 'myId0');
	assert.equal(objects[0].element.className, 'myClass0');
	assert.equal(objects[0].element.innerText, 'default html');
	assert.equal(objects[1].element.id, 'myId1');
	assert.equal(objects[1].element.className, 'myClass3');

	CSS3DObject1.p.useHTMLAttrib.set(true);
	objects = await CSS2DObjects();
	assert.equal(objects.length, 4);
	assert.equal(objects[0].element.id, 'myId0');
	assert.equal(objects[0].element.className, 'myClass0');
	assert.equal(objects[0].element.innerText, 'This is the content 0 (myClass0)');
	assert.equal(objects[1].element.id, 'myId1');
	assert.equal(objects[1].element.className, 'myClass3');
	assert.equal(objects[1].element.innerText, 'This is the content 10 (myClass3)');
});
