import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {HemisphereLightObjNode} from '../../../../src/engine/nodes/obj/HemisphereLight';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {BoxSopNode} from '../../../../src/engine/nodes/sop/Box';
import {EventsSopNode} from '../../../../src/engine/nodes/sop/Events';
import {CameraOrbitControlsEventNode} from '../../../../src/engine/nodes/event/CameraOrbitControls';

// create a scene
const scene = new PolyScene();

// create a Box
const geo = scene.root.createNode(GeoObjNode);
geo.createNode(BoxSopNode);

// add a light
scene.root.createNode(HemisphereLightObjNode);

// create and mount the viewer
const perspective_camera1 = scene.root.createNode(PerspectiveCameraObjNode);
const events1 = perspective_camera1.createNode(EventsSopNode);
const orbits_controls = events1.createNode(CameraOrbitControlsEventNode);
perspective_camera1.p.controls.set(orbits_controls.full_path());
perspective_camera1.p.t.set([3, 3, 3]);
const element = document.getElementById('app');
if (element) {
	perspective_camera1.createViewer(element);
} else {
	console.error('element not found');
}
