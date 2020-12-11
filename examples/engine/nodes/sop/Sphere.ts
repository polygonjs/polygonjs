import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {HemisphereLightObjNode} from '../../../../src/engine/nodes/obj/HemisphereLight';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {SphereSopNode} from '../../../../src/engine/nodes/sop/Sphere';
import {EventsSopNode} from '../../../../src/engine/nodes/sop/Events';
import {CameraOrbitControlsEventNode} from '../../../../src/engine/nodes/event/CameraOrbitControls';

// create a scene
const scene = new PolyScene();

// create a Box
const geo = scene.root.createNode(GeoObjNode);
const sphere = geo.createNode(SphereSopNode);

// add a light
scene.root.createNode(HemisphereLightObjNode);

// create a camera, add orbit_controls and mount the viewer
const perspective_camera1 = scene.root.createNode(PerspectiveCameraObjNode);
const events1 = perspective_camera1.createNode(EventsSopNode);
const orbits_controls = events1.createNode(CameraOrbitControlsEventNode);
perspective_camera1.p.controls.set(orbits_controls.full_path());
perspective_camera1.p.t.set([5, 5, 5]);
const element = document.getElementById('app');
if (element) {
	perspective_camera1.createViewer(element);
} else {
	console.error('element #app not found');
}

// EXPORT
const nodes = [sphere];
export {scene, nodes};
