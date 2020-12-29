import {PolyScene} from './index_all';
import {BaseNodeType} from './nodes/_Base';
import {PerspectiveCameraObjNode} from './nodes/obj/PerspectiveCamera';

import {AllRegister} from './poly/registers/All';
AllRegister.run();
// anim
import {AnimPosition} from '../../examples/engine/nodes/anim/Position';
// mat
import {MatMeshBasic} from '../../examples/engine/nodes/mat/MeshBasic';
import {MatMeshLambert} from '../../examples/engine/nodes/mat/MeshLambert';
// sop
import {SopAdd} from '../../examples/engine/nodes/sop/Add';
import {SopAdd_createLine} from '../../examples/engine/nodes/sop/Add.create_line';
import {SopAttribAddMult} from '../../examples/engine/nodes/sop/AttribAddMult';
import {SopAttribCopy} from '../../examples/engine/nodes/sop/AttribCopy';
import {SopAttribCreate} from '../../examples/engine/nodes/sop/AttribCreate';
import {SopBlend} from '../../examples/engine/nodes/sop/Blend';
import {SopBox} from '../../examples/engine/nodes/sop/Box';
import {SopFile} from '../../examples/engine/nodes/sop/File';
import {SopNoise} from '../../examples/engine/nodes/sop/Noise';
import {SopRoundedBox} from '../../examples/engine/nodes/sop/RoundedBox';
import {SopSphere} from '../../examples/engine/nodes/sop/Sphere';
import {SopSphereIcosahedron} from '../../examples/engine/nodes/sop/Sphere.icosahedron';
import {SopSubdivide} from '../../examples/engine/nodes/sop/Subdivide';
import {SopSwitch} from '../../examples/engine/nodes/sop/Switch';
import {SopTetrahedron} from '../../examples/engine/nodes/sop/Tetrahedron';
import {SopTorus} from '../../examples/engine/nodes/sop/Torus';
import {SopTorusKnot} from '../../examples/engine/nodes/sop/TorusKnot';

const ANIM = [AnimPosition];
const MAT = [MatMeshBasic, MatMeshLambert];
const SOP = [
	SopAdd,
	SopAdd_createLine,
	SopAttribAddMult,
	SopAttribCopy,
	SopAttribCreate,
	SopBlend,
	SopBox,
	SopFile,
	SopNoise,
	SopRoundedBox,
	SopSphere,
	SopSphereIcosahedron,
	SopSubdivide,
	SopSwitch,
	SopTetrahedron,
	SopTorus,
	SopTorusKnot,
];
console.log('ANIM', ANIM.length);
console.log('MAT', MAT.length);
console.log('SOP', SOP.length);

interface SceneBuilderResult {
	scene: PolyScene;
	camera: PerspectiveCameraObjNode;
	nodes: BaseNodeType[];
	htmlNodes?: Dictionary<BaseNodeType>;
}

const result: SceneBuilderResult = AnimPosition();
(window as any).scene = result.scene;

const htmlNodes = result.htmlNodes;
if (htmlNodes) {
	for (let k of Object.keys(htmlNodes)) {
		(window as any)[k] = htmlNodes[k];
	}
}

result.camera.createViewer(document.getElementById('app')!);
