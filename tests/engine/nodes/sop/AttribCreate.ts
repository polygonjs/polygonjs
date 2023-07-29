import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Vector4} from 'three';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {AttribType, AttribClass, AttribSize} from '../../../../src/core/geometry/Constant';
import {CoreEntity} from '../../../../src/core/geometry/Entity';
import {TransformTargetType} from '../../../../src/core/Transform';
import {CoreType} from '../../../../src/core/Type';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {AttribCreateSopNode} from '../../../../src/engine/nodes/sop/AttribCreate';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector2Param} from '../../../../src/engine/params/Vector2';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {Vector4Param} from '../../../../src/engine/params/Vector4';
import {StringOrNumber2, StringOrNumber3, StringOrNumber4} from '../../../../src/types/GlobalTypes';
export function testenginenodessopAttribCreate(qUnit: QUnit) {

qUnit.test('sop/attribCreate simple float vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set(3.5);
	attrib_create1.setInput(0, box1);

	let container = await attrib_create1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group.threejsObjectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test') as BufferAttribute;
	assert.equal(array.length, container.pointsCount());
	assert.equal(array[0], 3.5);

	const cloned_geo = geometry.clone();
	const cloned_array = (cloned_geo.getAttribute('test') as BufferAttribute).array;
	assert.equal(cloned_array.length, container.pointsCount());
	assert.equal(cloned_array[0], 3.5);
});

qUnit.test('sop/attribCreate expression float vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('(@ptnum+1)*3');
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group.threejsObjectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test') as BufferAttribute;
	assert.equal(array.length, container.pointsCount());
	assert.equal(array[0], 3);
	assert.equal(array[1], 6);
	assert.equal(array[2], 9);
});

qUnit.test('sop/attribCreate expression float vertex from position', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@P.y > 0');
	attrib_create1.setInput(0, sphere1);

	const container = await attrib_create1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group.threejsObjectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test') as BufferAttribute;
	assert.equal(array.length, container.pointsCount());
	assert.equal(array[0], 1);
	assert.equal(array[1], 1);
	assert.equal(array[2], 1);
	assert.equal(array[array.length - 1], 0);
	assert.equal(array[array.length - 2], 0);
});

qUnit.test('sop/attribCreate expression from a non existing attribute', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@doesnotexist > 0');
	attrib_create1.setInput(0, sphere1);

	await attrib_create1.compute();
	assert.ok(attrib_create1.states.error.active());
	assert.equal(attrib_create1.states.error.message(), 'expression evalution error: attribute not found');

	attrib_create1.p.value1.set('@P.y > 0');
	await attrib_create1.compute();
	assert.ok(!attrib_create1.states.error.active());
});

qUnit.test('sop/attribCreate simple vector2 vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(2);
	attrib_create1.p.value2.set([3.5, 5]);
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group.threejsObjectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test') as BufferAttribute;

	assert.equal(array.length, container.pointsCount() * 2);
	assert.equal(array[0], 3.5);
	assert.equal(array[1], 5);
	assert.equal(array[2], 3.5);
	assert.equal(array[3], 5);
	assert.equal(array[4], 3.5);
	assert.equal(array[5], 5);
});

qUnit.test('sop/attribCreate simple vector vertex', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(3);
	attrib_create1.p.value3.set([3.5, 5, 8]);
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.compute();
	const core_group = container.coreContent()!;
	const geometry = core_group.threejsObjectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	const {array} = geometry.getAttribute('test') as BufferAttribute;

	assert.equal(array.length, container.pointsCount() * 3);
	assert.equal(array[0], 3.5);
	assert.equal(array[1], 5);
	assert.equal(array[2], 8);
	assert.equal(array[3], 3.5);
});

qUnit.test('sop/attribCreate expression vector vertex', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.p.size.set(3);
	attrib_create1.p.value3.set([1, 2, 3]);
	attrib_create1.p.value3.x.set('@ptnum');
	attrib_create1.setInput(0, plane1);

	let container = await attrib_create1.compute();
	let core_group = container.coreContent()!;
	let geometry = core_group.threejsObjectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	let array = (geometry.getAttribute('test') as BufferAttribute).array;

	assert.equal(array.length, container.pointsCount() * 3);
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[9], 3);

	// test to make sure it can reload with an expression on a vector
	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	// console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();
	const attrib_create2 = scene2.node(attrib_create1.path()) as AttribCreateSopNode;
	container = await attrib_create2.compute();
	core_group = container.coreContent()!;
	geometry = core_group.threejsObjectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	array = (geometry.getAttribute('test') as BufferAttribute).array;

	assert.equal(array.length, container.pointsCount() * 3);
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[9], 3);
});

qUnit.test('sop/attribCreate on existing attrib vector2 uv', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('uv');
	attrib_create1.p.size.set(2);
	attrib_create1.p.value2.x.set('@uv.x*2');
	attrib_create1.p.value2.y.set('@uv.y*2');
	attrib_create1.setInput(0, plane1);

	let container, core_group, geometry, array;
	container = await attrib_create1.compute();
	core_group = container.coreContent()!;
	geometry = core_group.threejsObjectsWithGeo()[0].geometry;
	array = (geometry.getAttribute('uv') as BufferAttribute).array as number[];
	assert.ok(core_group);
	assert.ok(geometry);

	assert.equal(array.length, container.pointsCount() * 2);
	assert.equal(array.join(','), [0, 2, 2, 2, 0, 0, 2, 0].join(','));

	attrib_create1.p.value2.x.set('@uv.y');
	attrib_create1.p.value2.y.set('@uv.x');
	container = await attrib_create1.compute();
	core_group = container.coreContent()!;
	geometry = core_group.threejsObjectsWithGeo()[0].geometry;
	array = (geometry.getAttribute('uv') as BufferAttribute).array as number[];
	assert.equal(array.join(','), [1, 0, 1, 1, 0, 0, 0, 1].join(','));
});

qUnit.test('sop/attribCreate simple float object', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.setAttribClass(AttribClass.OBJECT);
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set(3.5);
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.compute();
	const core_group = container.coreContent()!;
	const object = core_group.allObjects()[0];
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: 3.5}});
});

qUnit.test('sop/attribCreate simple vector2 object', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.setAttribClass(AttribClass.OBJECT);
	attrib_create1.p.size.set(2);
	attrib_create1.p.value2.set([3.5, 12]);
	attrib_create1.setInput(0, box1);

	let container = await attrib_create1.compute();
	let core_group = container.coreContent()!;
	let object = core_group.allObjects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: new Vector2(3.5, 12)}});

	attrib_create1.p.value2.x.set('$F*2+1.5');
	scene.setFrame(10);
	assert.ok(attrib_create1.p.value2.x.isDirty());
	assert.ok(attrib_create1.p.value2.isDirty());
	assert.ok(attrib_create1.isDirty());
	container = await attrib_create1.compute();
	core_group = container.coreContent()!;
	object = core_group.allObjects()[0];
	assert.deepEqual(object.userData, {attributes: {test: new Vector2(21.5, 12)}});
});

qUnit.test('sop/attribCreate simple vector object', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test');
	attrib_create1.setAttribClass(AttribClass.OBJECT);
	attrib_create1.p.size.set(3);
	attrib_create1.p.value3.set([3.5, 12, 17]);
	attrib_create1.setInput(0, box1);

	const container = await attrib_create1.compute();
	const core_group = container.coreContent()!;
	const object = core_group.allObjects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test: new Vector3(3.5, 12, 17)}});
});

qUnit.test('sop/attribCreate simple string object', async (assert) => {
	const scene = window.scene;
	scene.setFrame(1);
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('test_string');
	attrib_create1.setAttribClass(AttribClass.OBJECT);
	attrib_create1.p.size.set(1);
	attrib_create1.setAttribType(AttribType.STRING);
	attrib_create1.p.string.set('pt_`$F`');
	attrib_create1.setInput(0, box1);

	let container = await attrib_create1.compute();
	let core_group = container.coreContent()!;
	let object = core_group.allObjects()[0];
	assert.ok(core_group);
	assert.ok(object);

	assert.deepEqual(object.userData, {attributes: {test_string: 'pt_1'}});

	scene.setFrame(12);
	container = await attrib_create1.compute();
	core_group = container.coreContent()!;
	object = core_group.allObjects()[0];
	assert.deepEqual(object.userData, {attributes: {test_string: 'pt_12'}});

	attrib_create1.p.string.set('`$F*2`');
	container = await attrib_create1.compute();
	core_group = container.coreContent()!;
	object = core_group.allObjects()[0];
	assert.deepEqual(object.userData, {attributes: {test_string: '24'}});
});

qUnit.test('sop/attribCreate for many points completes in reasonable time', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const box1 = geo1.createNode('box');
	const bbox_scatter1 = geo1.createNode('bboxScatter');
	bbox_scatter1.setInput(0, box1);
	bbox_scatter1.p.stepSize.set(0.5);
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.setInput(0, bbox_scatter1);

	attrib_create1.p.name.set('ptid');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');

	let container;
	container = await bbox_scatter1.compute();
	let core_group = container.coreContent()!;
	assert.equal(core_group.points().length, 27);
	assert.less_than(bbox_scatter1.cookController.cooksCount(), 20);

	container = await attrib_create1.compute();
	core_group = container.coreContent()!;
	assert.less_than(attrib_create1.cookController.cooksCount(), 20);

	const point = core_group.points()[3];
	assert.equal(point.attribValue('ptid'), 3);

	bbox_scatter1.p.stepSize.set(0.1);
	container = await attrib_create1.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.points().length, 1331);

	assert.less_than(attrib_create1.cookController.cooksCount(), 80);

	window.scene.performance.stop();

	// test to make sure it can reload with an expression
	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	// console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();
	const attrib_create2 = scene2.node(attrib_create1.path()) as AttribCreateSopNode;
	container = await attrib_create2.compute();
	core_group = container.coreContent()!;
	assert.equal(core_group.points().length, 1331);
});

qUnit.test('sop/attribCreate for string on vertices with expr', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.setInput(0, box1);
	attrib_create1.p.name.set('ids');
	attrib_create1.setAttribType(AttribType.STRING);
	attrib_create1.p.string.set('pt_`@ptnum*2`');

	let container = await attrib_create1.compute();
	assert.equal(container.pointsCount(), 24, 'has 24 pts');
	let points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('ids'), 'pt_0', 'pt 0 has pt_0');
	assert.equal(points[1].attribValue('ids'), 'pt_2', 'pt 1 has pt_2');
	assert.equal(points[2].attribValue('ids'), 'pt_4', 'pt 2 has pt_4');

	attrib_create1.p.string.set('`@ptnum*2`_pt');
	container = await attrib_create1.compute();
	points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('ids'), '0_pt', 'pt 0 has 0_pt');
	assert.equal(points[1].attribValue('ids'), '2_pt', 'pt 1 has 2_pt');
	assert.equal(points[2].attribValue('ids'), '4_pt', 'pt 2 has 4_pt');

	attrib_create1.p.string.set('`@ptnum*2`');
	container = await attrib_create1.compute();
	points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('ids'), '0');
	assert.equal(points[1].attribValue('ids'), '2');
	assert.equal(points[2].attribValue('ids'), '4');
});

qUnit.test('sop/attribCreate for string on vertices without expr', async (assert) => {
	const geo1 = window.geo1;

	window.scene.performance.start();

	const box1 = geo1.createNode('box');
	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.setInput(0, box1);
	attrib_create1.p.name.set('ids');
	attrib_create1.setAttribType(AttribType.STRING);
	attrib_create1.p.string.set('test');

	let container = await attrib_create1.compute();
	assert.equal(container.pointsCount(), 24, 'has 24 pts');
	let points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('ids'), 'test', 'pt 0 has pt_0');
	assert.equal(points[1].attribValue('ids'), 'test', 'pt 1 has pt_2');
	assert.equal(points[2].attribValue('ids'), 'test', 'pt 2 has pt_4');

	const geometry = container.coreContent()!.threejsObjectsWithGeo()[0].geometry;
	const array = (geometry.getAttribute('ids') as BufferAttribute).array;
	assert.equal(array.length, 24);
	assert.equal(array[0], 0);
	assert.equal(array[1], 0);
	assert.equal(array[2], 0);
});

qUnit.test('sop/attribCreate for string referring other string attributes', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attribCreate_class = geo1.createNode('attribCreate');
	const attribCreate_html = geo1.createNode('attribCreate');
	attribCreate_class.setInput(0, plane1);
	attribCreate_html.setInput(0, attribCreate_class);

	attribCreate_class.p.name.set('class');
	attribCreate_class.setAttribType(AttribType.STRING);
	attribCreate_class.p.string.set('myClass`@ptnum*3`');
	attribCreate_html.p.name.set('html');
	attribCreate_html.setAttribType(AttribType.STRING);
	attribCreate_html.p.string.set('myId`@ptnum`-`@class`');

	let container = await attribCreate_html.compute();
	const coreGroup = container.coreContent()!;
	const points = coreGroup.points();
	assert.equal(points[0].attribValue('html'), 'myId0-myClass0');
	assert.equal(points[1].attribValue('html'), 'myId1-myClass3');
	assert.equal(points[2].attribValue('html'), 'myId2-myClass6');
});

qUnit.test(
	'sop/attribCreate for string referring other string attributes with some points having the same values',
	async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attribCreate_class = geo1.createNode('attribCreate');
		const attribCreate_html = geo1.createNode('attribCreate');
		attribCreate_class.setInput(0, plane1);
		attribCreate_html.setInput(0, attribCreate_class);

		attribCreate_class.p.name.set('class');
		attribCreate_class.setAttribType(AttribType.STRING);
		attribCreate_class.p.string.set('myClass`@ptnum%2`');
		attribCreate_html.p.name.set('html');
		attribCreate_html.setAttribType(AttribType.STRING);
		attribCreate_html.p.string.set('myId`@ptnum`-`@class`');

		let container = await attribCreate_html.compute();
		const coreGroup = container.coreContent()!;
		const points = coreGroup.points();
		assert.equal(points[0].attribValue('html'), 'myId0-myClass0');
		assert.equal(points[1].attribValue('html'), 'myId1-myClass1');
		assert.equal(points[2].attribValue('html'), 'myId2-myClass0');
	}
);

qUnit.test('sop/attribCreate object position', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');

	transform1.setInput(0, box1);
	transform2.setInput(0, box2);

	transform1.setApplyOn(TransformTargetType.OBJECT);
	transform2.setApplyOn(TransformTargetType.OBJECT);

	transform1.p.t.set([1, 2, 3]);
	transform2.p.t.set([4, 5, 6]);

	const merge1 = geo1.createNode('merge');
	merge1.setInput(0, transform1);
	merge1.setInput(1, transform2);

	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.setInput(0, merge1);
	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('center');
	attribCreate1.p.size.set(3);
	attribCreate1.p.value3.set(['@P.x', '@P.y', '@P.z']);

	let container = await attribCreate1.compute();
	const coreGroup = container.coreContent()!;
	const objects = coreGroup.allCoreObjects();
	assert.deepEqual((objects[0].attribValue('center') as Vector3).toArray(), [1, 2, 3]);
	assert.deepEqual((objects[1].attribValue('center') as Vector3).toArray(), [4, 5, 6]);
});

interface MultiTestOptions {
	existingAttrib: boolean;
	attribClass: AttribClass;
	attribType: AttribType;
	attribSize: AttribSize;
	withExpression: boolean;
	withGroup: boolean;
	withValidGroup: boolean;
}

qUnit.test('sop/attribCreate using group or not', async (assert) => {
	const geo1 = window.geo1;

	function vParamNumeric(attribCreate: AttribCreateSopNode) {
		const size = attribCreate.pv.size;
		const vparam = [attribCreate.p.value1, attribCreate.p.value2, attribCreate.p.value3, attribCreate.p.value4][
			size - 1
		];
		return vparam;
	}
	function assignVParamNumeric(attribCreate: AttribCreateSopNode, valueN: string | number) {
		const param = vParamNumeric(attribCreate);
		if (param instanceof FloatParam) {
			param.set(valueN);
		}
		if (param instanceof Vector2Param) {
			const valuesN: StringOrNumber2 = [valueN, valueN];
			param.set(valuesN);
		}
		if (param instanceof Vector3Param) {
			const valuesN: StringOrNumber3 = [valueN, valueN, valueN];
			param.set(valuesN);
		}
		if (param instanceof Vector4Param) {
			const valuesN: StringOrNumber4 = [valueN, valueN, valueN, valueN];
			param.set(valuesN);
		}
	}
	// {"existingAttrib":true,"attribSize":1,"withExpression":true,"withGroup":true}
	function buildExpectedNumericValue(options: MultiTestOptions) {
		const {existingAttrib, withExpression, withGroup, withValidGroup} = options;
		if (existingAttrib) {
			if (withExpression) {
				if (withGroup) {
					if (withValidGroup) {
						return [7, 7, 2, 7];
					} else {
						return [7, 7, 7, 7];
					}
				} else {
					return [0, 1, 2, 3];
				}
			} else {
				if (withGroup) {
					if (withValidGroup) {
						return [7, 7, 1, 7];
					} else {
						return [7, 7, 7, 7];
					}
				} else {
					return [1, 1, 1, 1];
				}
			}
		} else {
			if (withExpression) {
				if (withGroup) {
					if (withValidGroup) {
						return [0, 0, 2, 0];
					} else {
						return [0, 0, 0, 0];
					}
				} else {
					return [0, 1, 2, 3];
				}
			} else {
				if (withGroup) {
					if (withValidGroup) {
						return [0, 0, 1, 0];
					} else {
						return [0, 0, 0, 0];
					}
				} else {
					return [1, 1, 1, 1];
				}
			}
		}
	}

	function buildExpectedValues(options: MultiTestOptions) {
		const {existingAttrib, attribType, attribSize, withExpression, withGroup, withValidGroup} = options;

		if (attribType == AttribType.NUMERIC) {
			const valueN = buildExpectedNumericValue(options);

			switch (attribSize) {
				case 1: {
					return valueN;
				}
				case 2: {
					return valueN.map((v) => new Vector2(v, v).toArray());
				}
				case 3: {
					return valueN.map((v) => new Vector3(v, v, v).toArray());
				}
				case 4: {
					return valueN.map((v) => new Vector4(v, v, v, v).toArray());
				}
			}
		} else {
			if (existingAttrib) {
				if (withExpression) {
					if (withGroup) {
						if (withValidGroup) {
							return ['defaultStringVal', 'defaultStringVal', 'pt2', 'defaultStringVal'];
						} else {
							return ['defaultStringVal', 'defaultStringVal', 'defaultStringVal', 'defaultStringVal'];
						}
					} else {
						return ['pt0', 'pt1', 'pt2', 'pt3'];
					}
				} else {
					if (withGroup) {
						if (withValidGroup) {
							return ['defaultStringVal', 'defaultStringVal', 'a', 'defaultStringVal'];
						} else {
							return ['defaultStringVal', 'defaultStringVal', 'defaultStringVal', 'defaultStringVal'];
						}
					} else {
						return ['a', 'a', 'a', 'a'];
					}
				}
			} else {
				if (withExpression) {
					if (withGroup) {
						if (withValidGroup) {
							return ['', '', 'pt2', ''];
						} else {
							return ['', '', '', ''];
						}
					} else {
						return ['pt0', 'pt1', 'pt2', 'pt3'];
					}
				} else {
					if (withGroup) {
						if (withValidGroup) {
							return ['', '', 'a', ''];
						} else {
							return ['', '', '', ''];
						}
					} else {
						return ['a', 'a', 'a', 'a'];
					}
				}
			}
		}
	}

	async function testOptions(options: MultiTestOptions, i: number) {
		const {existingAttrib, attribClass, attribType, attribSize, withExpression, withGroup, withValidGroup} =
			options;
		// if (i != 192) {
		// 	return;
		// }
		// console.log(i, options);
		const children = [...geo1.children()];
		for (let child of children) {
			geo1.removeNode(child);
		}

		const attribName = 'test';
		const plane1 = geo1.createNode('plane');
		plane1.setName(`plane_${i}`);
		const merge1 = geo1.createNode('merge');
		merge1.setInput(0, plane1);
		merge1.setInput(1, plane1);
		merge1.setInput(2, plane1);
		merge1.setInput(3, plane1);
		const geoSource = attribClass == AttribClass.VERTEX ? plane1 : merge1;
		const attribCreate1 = geo1.createNode('attribCreate');
		attribCreate1.setName(`attribCreate_main_${i}`);

		attribCreate1.setAttribClass(attribClass);
		attribCreate1.setAttribType(attribType);
		attribCreate1.p.name.set(attribName);
		attribCreate1.p.size.set(attribSize);
		if (attribType == AttribType.NUMERIC) {
			assignVParamNumeric(attribCreate1, withExpression ? '@ptnum' : 1);
		} else {
			attribCreate1.p.string.set(withExpression ? 'pt`@ptnum`' : 'a');
		}
		attribCreate1.p.group.set(withGroup ? (withValidGroup ? '2' : '999') : '');

		const attribCreate_tmp = geo1.createNode('attribCreate');
		attribCreate_tmp.setName(`attribCreate_tmp_${i}`);
		if (existingAttrib) {
			attribCreate_tmp.setAttribClass(attribClass);
			attribCreate_tmp.setAttribType(attribType);
			attribCreate_tmp.p.name.set(attribName);
			attribCreate_tmp.p.size.set(attribSize);
			if (attribType == AttribType.NUMERIC) {
				assignVParamNumeric(attribCreate_tmp, 7);
			} else {
				attribCreate_tmp.p.string.set('defaultStringVal');
			}
			attribCreate_tmp.setInput(0, geoSource);
			attribCreate1.setInput(0, attribCreate_tmp);
		} else {
			attribCreate1.setInput(0, geoSource);
		}
		const container = await attribCreate1.compute();
		// assert.notOk(attribCreate1.states.error.active());
		// assert.notOk(attribCreate1.states.error.message());
		const pts = container.coreContent()!.points();
		const coreObjects = container.coreContent()!.allCoreObjects();
		const entities = attribClass == AttribClass.VERTEX ? pts : coreObjects;

		const expectedValues = buildExpectedValues(options);
		assert.deepEqual(
			entities.map((p: CoreEntity) => {
				const v = p.attribValue(attribName);
				return CoreType.isVector(v) ? v.toArray() : v;
			}),
			expectedValues,
			`${i}-${JSON.stringify(options)}`
		);
	}

	const existingAttribs: boolean[] = [true, false];
	const attribClasses: AttribClass[] = [AttribClass.VERTEX, AttribClass.OBJECT];
	const attribTypes: AttribType[] = [AttribType.NUMERIC, AttribType.STRING];
	const attribSizes: AttribSize[] = [1, 2, 3, 4];
	const withExpressions: boolean[] = [true, false];
	const withGroups: boolean[] = [true, false];
	const withValidGroups: boolean[] = [true, false];

	let i = 0;

	for (let existingAttrib of existingAttribs) {
		for (let attribClass of attribClasses) {
			for (let attribType of attribTypes) {
				for (let attribSize of attribSizes) {
					for (let withExpression of withExpressions) {
						for (let withGroup of withGroups) {
							for (let withValidGroup of withValidGroups) {
								const options: MultiTestOptions = {
									existingAttrib,
									attribClass,
									attribType,
									attribSize,
									withExpression,
									withGroup,
									withValidGroup,
								};

								await testOptions(options, i);
								i++;
							}
						}
					}
				}
			}
		}
	}
});

}