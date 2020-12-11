import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {HemisphereLightObjNode} from '../../../../src/engine/nodes/obj/HemisphereLight';
import {FileSopNode} from '../../../../src/engine/nodes/sop/File';

// create a scene
const scene = new PolyScene();

// create a File SOP and set its url
const geo1 = scene.root.createNode(GeoObjNode);
const file1 = geo1.createNode(FileSopNode);
file1.p.url.set('/examples/models/male03.obj');

// add a light
scene.root.createNode(HemisphereLightObjNode);

// create and mount the viewer
const perspective_camera1 = scene.root.createNode(PerspectiveCameraObjNode);
const element = document.getElementById('app');
if (element) {
	perspective_camera1.createViewer(element);
}
