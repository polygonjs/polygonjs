import {CoreObject} from 'src/core/Object';
import 'tests/helpers/assertions';
import {GeoObjNode} from 'src/engine/nodes/obj/Geo';
import {TypedObjNode} from 'src/engine/nodes/obj/_Base';
import {TypedNode} from 'src/engine/nodes/_Base';
import {TypedCameraObjNode} from 'src/engine/nodes/obj/_BaseCamera';
import {PerspectiveCameraObjNode} from 'src/engine/nodes/obj/PerspectiveCamera';
import {FloatParam} from 'src/engine/params/Float';
import {TypedParam} from 'src/engine/params/_Base';

import {Vector3} from 'three/src/math/Vector3';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';

class Dummy extends CoreObject {
	is_dummy() {
		return true;
	}
}
class ExtendedDummy extends Dummy {
	is_extended_dummy() {
		return true;
	}
}
class Dummy2 extends CoreObject {
	is_dummy() {
		return true;
	}
}
class ExtendedDummy2 extends Dummy2 {
	is_extended_dummy2() {
		return true;
	}
}

QUnit.test('adds 1 + 2 to equal 3', (assert) => {
	const extended_dummy = new ExtendedDummy();
	const extended_dummy2 = new ExtendedDummy2();
	assert.ok(extended_dummy.is_a(Dummy));
	assert.ok(extended_dummy2.is_a(Dummy2));
	assert.notOk(extended_dummy.is_a(Dummy2));
	assert.notOk(extended_dummy2.is_a(Dummy));
});

QUnit.test('is_a finds ancestors', (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	assert.ok(CoreObject.is_a(geo1, GeoObjNode));
	assert.ok(CoreObject.is_a(geo1, TypedObjNode));
	assert.ok(CoreObject.is_a(geo1, TypedNode));
	const camera = scene.root.create_node('perspective_camera');
	assert.ok(CoreObject.is_a(camera, TypedNode));
	assert.ok(CoreObject.is_a(camera, TypedObjNode));
	assert.ok(CoreObject.is_a(camera, TypedCameraObjNode));
	assert.ok(CoreObject.is_a(camera, PerspectiveCameraObjNode));
	const param = geo1.p.tx;
	assert.ok(CoreObject.is_a(param, FloatParam));
	assert.ok(CoreObject.is_a(param, TypedParam));
	assert.ok(CoreObject.is_a(new Vector3(), Vector3));
	assert.ok(CoreObject.is_a(new PerspectiveCamera(), PerspectiveCamera));
	assert.ok(CoreObject.is_a(new PerspectiveCamera(), Object3D));
	assert.ok(CoreObject.is_a(new Mesh(), Object3D));
});
