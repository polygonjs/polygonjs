import type {QUnit} from '../helpers/QUnit';
import {CoreString} from '../../src/core/String';
export function testcoreString(qUnit: QUnit) {
	// qUnit.test('string timestamp', (assert) => {
	// 	assert.equal(CoreString.timestamp_to_seconds('2018-09-28 10:44:32'), 1538127872);

	// 	assert.equal(CoreString.seconds_to_timestamp(1538127872), '09:44:32');
	// });

	qUnit.test('string pluralize', (assert) => {
		assert.equal(CoreString.pluralize('node'), 'nodes');
		assert.equal(CoreString.pluralize('nodes'), 'nodes');
	});

	qUnit.test('string precision', (assert) => {
		assert.equal(CoreString.precision(12.7, 4), '12.7000');
		assert.equal(CoreString.precision(12.75789465, 4), '12.7578');
		assert.equal(CoreString.precision(12.0, 4), '12.0000');
		assert.equal(CoreString.precision(12, 4), '12.0000');

		assert.equal(CoreString.precision(12.52345, 6), '12.523450');
		assert.equal(CoreString.precision(12.52345, 5), '12.52345');
		assert.equal(CoreString.precision(12.52345, 4), '12.5234');
		assert.equal(CoreString.precision(12.52345, 3), '12.523');
		assert.equal(CoreString.precision(12.52345, 2), '12.52');
		assert.equal(CoreString.precision(12.52345, 1), '12.5');
		assert.equal(CoreString.precision(12.52345, 0), '12');
		assert.equal(CoreString.precision(12.52345, -1), '12');

		assert.equal(CoreString.precision(12.5, -2), '12');
		assert.equal(CoreString.precision(12.56, -2), '12');
	});

	qUnit.test('string matchMask', (assert) => {
		assert.ok(CoreString.matchMask('abc', 'a*'));
		assert.notOk(CoreString.matchMask('abc', 'e*'));

		assert.ok(CoreString.matchMask('abc', 'a* d*'));
		assert.notOk(CoreString.matchMask('abc', 'e* d*'));
	});
	qUnit.test('string matchMask with exclusion', (assert) => {
		assert.notOk(CoreString.matchMask('abc', '* ^ab*'), '* ^ab*');
		assert.ok(CoreString.matchMask('abc', 'abc* ^de*'), 'abc* ^de*');
		assert.ok(CoreString.matchMask('abcdef', 'abc* ^de*'), 'abc* ^de*');
		assert.notOk(CoreString.matchMask('abcdef', 'abc* ^*de*'), 'abc* ^*de*');
	});
	qUnit.test('string matchMask does not break with invalid input', (assert) => {
		assert.notOk(CoreString.matchMask('abc', '{"actor":"var nodesByRequestedName_1372 = {}\ncon'), 'abc* ^de*');
		assert.notOk(
			CoreString.matchMask(
				'abc',
				`{"actor":"var nodesByRequestedName_1372 = {}\nconst actor1_nodes /*: ReturnedNodeDataDict*/ = {};\nactor1_nodes['setGeometryInstanceTransforms1'] = {node: parentNode.node('setGeometryInstanceTransforms1')}\nactor1_nodes['getChildrenPhysicsRBDProperties1'] = {node: parentNode.node('getChildrenPhysicsRBDProperties1')}\nactor1_nodes['getChildrenProperties1'] = {node: parentNode.node('getChildrenProperties1')}\nfunction create_getChildrenPhysicsRBDProperties1(parentNode/*: ActorSopNode*/){\n\tvar getChildrenPhysicsRBDProperties1 = parentNode.createNode('getChildrenPhysicsRBDProperties')\n\tgetChildrenPhysicsRBDProperties1.setName('getChildrenPhysicsRBDProperties1')\n\tconst getChildrenPhysicsRBDProperties1_nodes /*: ReturnedNodeDataDict*/ = {};\n\tgetChildrenPhysicsRBDProperties1.uiData.setPosition(-150, 0)\n\tgetChildrenPhysicsRBDProperties1.params.postCreateSpareParams()\n\tgetChildrenPhysicsRBDProperties1.params.runOnSceneLoadHooks()\n\treturn {node: getChildrenPhysicsRBDProperties1, children: getChildrenPhysicsRBDProperties1_nodes}\n}\nactor1_nodes['getChildrenPhysicsRBDProperties1'] = create_getChildrenPhysicsRBDProperties1(parentNode)\nnodesByRequestedName_1372['getChildrenPhysicsRBDProperties1'] = actor1_nodes['getChildrenPhysicsRBDProperties1'].node\nreturn nodesByRequestedName_1372"}`
			),
			'abc* ^de*'
		);
	});

	qUnit.test('string attrib_names', (assert) => {
		assert.deepEqual(CoreString.attribNames('position, normal'), ['position', 'normal']);
		assert.deepEqual(CoreString.attribNames('position,normal'), ['position', 'normal']);
		assert.deepEqual(CoreString.attribNames('position,   normal'), ['position', 'normal']);
		assert.deepEqual(CoreString.attribNames('position,		  normal'), ['position', 'normal']);
		assert.deepEqual(CoreString.attribNames('  position  ,		  normal  '), ['position', 'normal']);
		assert.deepEqual(CoreString.attribNames('position,normal,'), ['position', 'normal']);
	});

	qUnit.test('string increment name', (assert) => {
		assert.equal(CoreString.increment('a'), 'a1');
		assert.equal(CoreString.increment('a12_11'), 'a12_12');
		assert.equal(CoreString.increment('a1211'), 'a1212');
		assert.equal(CoreString.increment('attribCreate'), 'attribCreate1');
		assert.equal(CoreString.increment('attrib_create1'), 'attrib_create2');
		assert.equal(CoreString.increment('attrib_create2'), 'attrib_create3');
		assert.equal(CoreString.increment('attrib_create3'), 'attrib_create4');
		assert.equal(CoreString.increment('attrib_create4'), 'attrib_create5');
		assert.equal(CoreString.increment('attrib_create5'), 'attrib_create6');
		assert.equal(CoreString.increment('attrib_create6'), 'attrib_create7');
		assert.equal(CoreString.increment('attrib_create7'), 'attrib_create8');
		assert.equal(CoreString.increment('attrib_create8'), 'attrib_create9');
		assert.equal(CoreString.increment('attrib_create9'), 'attrib_create10');
		assert.equal(CoreString.increment('attrib_create10'), 'attrib_create11');
		assert.equal(CoreString.increment('attrib_create11'), 'attrib_create12');
		assert.equal(CoreString.increment('attrib_create12'), 'attrib_create13');
		assert.equal(CoreString.increment('attrib_create13'), 'attrib_create14');
		assert.equal(CoreString.increment('attrib_create14'), 'attrib_create15');
		assert.equal(CoreString.increment('attrib_create15'), 'attrib_create16');
		assert.equal(CoreString.increment('attrib_create16'), 'attrib_create17');
		assert.equal(CoreString.increment('attrib_create17'), 'attrib_create18');
		assert.equal(CoreString.increment('attrib_create18'), 'attrib_create19');
		assert.equal(CoreString.increment('attrib_create19'), 'attrib_create20');
		assert.equal(CoreString.increment('attrib_create20'), 'attrib_create21');
		assert.equal(CoreString.increment('attrib_create21'), 'attrib_create22');
		assert.equal(CoreString.increment('attrib_create22'), 'attrib_create23');
		assert.equal(CoreString.increment('attrib_create23'), 'attrib_create24');
		assert.equal(CoreString.increment('attrib_create24'), 'attrib_create25');
		assert.equal(CoreString.increment('attrib_create25'), 'attrib_create26');
		assert.equal(CoreString.increment('attrib_create26'), 'attrib_create27');
		assert.equal(CoreString.increment('attrib_create27'), 'attrib_create28');
		assert.equal(CoreString.increment('attrib_create28'), 'attrib_create29');
		assert.equal(CoreString.increment('attrib_create29'), 'attrib_create30');
		assert.equal(CoreString.increment('attrib_create30'), 'attrib_create31');
		assert.equal(CoreString.increment('attrib_create31'), 'attrib_create32');
		assert.equal(CoreString.increment('attrib_create32'), 'attrib_create33');

		// do not remove the zero on the left
		assert.equal(CoreString.increment('attrib_create_01'), 'attrib_create_02');

		// do not add a number if we have only zeros
		assert.equal(CoreString.increment('attrib_create_000'), 'attrib_create_001');
		assert.equal(CoreString.increment('attrib_create_001'), 'attrib_create_002');
		assert.equal(CoreString.increment('attrib_create_00'), 'attrib_create_01');
		assert.equal(CoreString.increment('attrib_create_01'), 'attrib_create_02');
		assert.equal(CoreString.increment('attrib_create_0000'), 'attrib_create_0001');
		assert.equal(CoreString.increment('attrib_create_0001'), 'attrib_create_0002');
	});

	qUnit.test('indices', (assert) => {
		assert.deepEqual(CoreString.indices('1'), [1]);
		assert.deepEqual(CoreString.indices('1,2'), [1, 2]);
		assert.deepEqual(CoreString.indices('1,2 4-6'), [1, 2, 4, 5, 6]);
	});

	qUnit.test('number conversion', (assert) => {
		assert.ok(CoreString.isNumber('1'));
		assert.ok(CoreString.isNumber('1.'));
		assert.ok(CoreString.isNumber('1.1'));
		assert.ok(CoreString.isNumber('001.1'));
		assert.notOk(CoreString.isNumber('1+1'));
		assert.notOk(CoreString.isNumber('1.1A'));
		assert.notOk(CoreString.isNumber('A'));
		assert.notOk(CoreString.isNumber('A1.'));
	});

	qUnit.test('CoreString.upperFirst', (assert) => {
		assert.equal(CoreString.upperFirst('abcde'), 'Abcde');
		assert.equal(CoreString.upperFirst('Abcde'), 'Abcde');
		assert.equal(CoreString.upperFirst('1bcde'), '1bcde');
	});
	qUnit.test('CoreString.titleize', (assert) => {
		assert.equal(CoreString.titleize(''), '');
		assert.equal(CoreString.titleize('a '), 'A ');
		assert.equal(CoreString.titleize('ab '), 'Ab ');
		assert.equal(CoreString.titleize('ab a'), 'Ab A');
		assert.equal(CoreString.titleize('spring_torus'), 'Spring Torus');
		assert.equal(CoreString.titleize('spring torus'), 'Spring Torus');
		assert.equal(CoreString.titleize('abcde'), 'Abcde');
		assert.equal(CoreString.titleize('Abcde'), 'Abcde');
		assert.equal(CoreString.titleize('1bcde'), '1bcde');
	});
	qUnit.test('CoreString.camelCase', (assert) => {
		assert.equal(CoreString.camelCase('spring torus'), 'springTorus');
		assert.equal(CoreString.camelCase('spring_torus'), 'springTorus');
		assert.equal(CoreString.camelCase('hemisphere_light'), 'hemisphereLight');
		assert.equal(CoreString.camelCase('mesh_basic_builder'), 'meshBasicBuilder');
		assert.equal(CoreString.camelCase('abcde'), 'abcde');
		assert.equal(CoreString.camelCase('Abcde'), 'abcde');
		assert.equal(CoreString.camelCase('1bcde'), '1bcde');
		assert.equal(CoreString.camelCase('fit_from_01'), 'fitFrom01');
		assert.equal(CoreString.camelCase('fit_from_01_to_variance'), 'fitFrom01ToVariance');
	});
	qUnit.test('CoreString.ensureFloat', (assert) => {
		assert.equal(CoreString.ensureFloat(2), '2.0');
		assert.equal(CoreString.ensureFloat(10), '10.0');
		assert.equal(CoreString.ensureFloat(1.6), '1.6');
		assert.equal(CoreString.ensureFloat(-1.6), '-1.6');
	});

	qUnit.test('CoreString.ensureInteger', (assert) => {
		assert.equal(CoreString.ensureInteger(2), '2');
		assert.equal(CoreString.ensureInteger(10), '10');
		assert.equal(CoreString.ensureInteger(1.6), '1');
		assert.equal(CoreString.ensureInteger(-1.6), '-1');
	});
}
