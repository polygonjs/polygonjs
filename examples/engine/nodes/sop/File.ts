import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {HemisphereLightObjNode} from '../../../../src/engine/nodes/obj/HemisphereLight';
import {FileSopNode} from '../../../../src/engine/nodes/sop/File';

const scene = new PolyScene();
scene.root.createNode(HemisphereLightObjNode);
const perspective_camera1 = scene.root.createNode(PerspectiveCameraObjNode);
const geo1 = scene.root.createNode(GeoObjNode);
const file1 = geo1.createNode(FileSopNode);
file1.p.url.set('/examples/models/male03.obj');
const element = document.getElementById('app');
if (element) {
	perspective_camera1.createViewer(element);
}
