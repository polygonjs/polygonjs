import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {HemisphereLightObjNode} from '../../../../src/engine/nodes/obj/HemisphereLight';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {FileSopNode} from '../../../../src/engine/nodes/sop/File';
import {EventsSopNode} from '../../../../src/engine/nodes/sop/Events';
import {CameraOrbitControlsEventNode} from '../../../../src/engine/nodes/event/CameraOrbitControls';
import {Poly} from '../../../../src/engine/Poly';
import {ModuleName} from '../../../../src/engine/poly/registers/modules/_BaseRegister';
const OBJLoader2 = import('../../../../src/modules/three/examples/jsm/loaders/OBJLoader2');

// create a scene
const scene = new PolyScene();

// create a File SOP and set its url
const geo1 = scene.root.createNode(GeoObjNode);
const file1 = geo1.createNode(FileSopNode);
Poly.instance().modulesRegister.register(ModuleName.OBJLoader2, OBJLoader2);
file1.p.url.set('/examples/models/wolf.obj');

// add a light
scene.root.createNode(HemisphereLightObjNode);

// create and mount the viewer
const perspective_camera1 = scene.root.createNode(PerspectiveCameraObjNode);
const events1 = perspective_camera1.createNode(EventsSopNode);
const orbits_controls = events1.createNode(CameraOrbitControlsEventNode);
perspective_camera1.p.controls.set(orbits_controls.full_path());
perspective_camera1.p.t.set([5, 5, 5]);

const element = document.getElementById('app');
if (element) {
	perspective_camera1.createViewer(element);
} else {
	console.error('element not found');
}
