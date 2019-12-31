// import {Vector3} from 'three/src/math/Vector3';
// import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
// import {Object3D} from 'three/src/core/Object3D';
// import {Mesh} from 'three/src/objects/Mesh';
// const THREE = {Mesh, Object3D, PerspectiveCamera, Vector3};
import {CoreObject} from '../../src/core/Object'

// import {BaseNode} from 'src/Engine/Node/_Base'
// import {BaseNodeObj} from 'src/Engine/Node/Obj/_Base'
// import {BaseCamera} from 'src/Engine/Node/Obj/_BaseCamera'
// import {BaseNodeObjGeo} from 'src/Engine/Node/Obj/Geo'

// import {BaseParam} from 'src/Engine/Param/_Base'
// import {ParamFloat} from 'src/Engine/Param/Float'

class Dummy extends CoreObject {
	is_dummy() {
		return true
	}
}
class ExtendedDummy extends Dummy {
	is_extended_dummy() {
		return true
	}
}
class Dummy2 extends CoreObject {
	is_dummy() {
		return true
	}
}
class ExtendedDummy2 extends Dummy2 {
	is_extended_dummy2() {
		return true
	}
}

QUnit.test('is_a finds ancestors for dummy', (assert) => {
	const extended_dummy = new ExtendedDummy()
	const extended_dummy2 = new ExtendedDummy2()
	assert.ok(extended_dummy.is_a(Dummy))
	assert.ok(extended_dummy2.is_a(Dummy2))
	assert.notOk(extended_dummy.is_a(Dummy2))
	assert.notOk(extended_dummy2.is_a(Dummy))
})

QUnit.skip('is_a finds ancestors', (assert) => {
	// const geo1 = window.geo1
	// const scene = window.scene
	// assert.ok( geo1.is_a(BaseNodeObjGeo))
	// assert.ok( geo1.is_a(BaseNodeObj))
	// assert.ok( geo1.is_a(BaseNode))
	// const camera = scene.root().create_node('perspective_camera')
	// assert.ok( camera.is_a(BaseNode))
	// assert.ok( camera.is_a(BaseNodeObj))
	// assert.ok( camera.is_a(BaseCamera))
	// const param = geo1.param('tx')
	// assert.ok( param.is_a(ParamFloat))
	// assert.ok( param.is_a(BaseParam))
	// assert.ok( CoreObject.is_a(param, ParamFloat))
	// assert.ok( CoreObject.is_a(new THREE.Vector3(), THREE.Vector3))
	// assert.ok( CoreObject.is_a(new THREE.PerspectiveCamera(), THREE.PerspectiveCamera))
	// assert.ok( CoreObject.is_a(new THREE.PerspectiveCamera(), THREE.Object3D))
	// assert.ok( CoreObject.is_a(new THREE.Mesh(), THREE.Object3D))
})
