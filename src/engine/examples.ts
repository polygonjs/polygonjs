import {PolyDictionary} from '../types/GlobalTypes';
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
// expressions
import {ExpressionBbox} from '../../examples/engine/expressions/bbox';
import {ExpressionCentroid} from '../../examples/engine/expressions/centroid';

const examples = {
	nodes: {
		ANIM: {
			position: AnimPosition,
		},
		MAT: {
			meshBasic: MatMeshBasic,
			meshLambert: MatMeshLambert,
		},
		SOP: {
			add: SopAdd,
			add_createLine: SopAdd_createLine,
			attribAddMult: SopAttribAddMult,
			attribCopy: SopAttribCopy,
			attribCreate: SopAttribCreate,
			blend: SopBlend,
			box: SopBox,
			file: SopFile,
			noise: SopNoise,
			roundedBox: SopRoundedBox,
			sphere: SopSphere,
			sphereIcosahedron: SopSphereIcosahedron,
			subdivide: SopSubdivide,
			switch: SopSwitch,
			tetrahedron: SopTetrahedron,
			torus: SopTorus,
			torusKnot: SopTorusKnot,
		},
	},
	expressions: {
		bbox: ExpressionBbox,
		centroid: ExpressionCentroid,
	},
};

// console.log('ANIM', Object.keys(examples.nodes.ANIM).length);
// console.log('MAT', Object.keys(examples.nodes.MAT).length);
// console.log('SOP', Object.keys(examples.nodes.SOP).length);
// console.log('EXPRESSION', Object.keys(examples.expressions).length);

interface SceneBuilderResult {
	scene: PolyScene;
	camera: PerspectiveCameraObjNode;
	nodes: BaseNodeType[];
	htmlNodes?: PolyDictionary<BaseNodeType>;
}

function redirectToExamples() {
	window.location.href = '/examples';
}

function loadExample(example: SceneBuilderResult) {
	const result: SceneBuilderResult = ExpressionCentroid();
	(window as any).scene = result.scene;

	const htmlNodes = result.htmlNodes;
	if (htmlNodes) {
		for (let k of Object.keys(htmlNodes)) {
			(window as any)[k] = htmlNodes[k];
		}
	}

	result.camera.createViewer(document.getElementById('app')!);
}

function loadExampleData() {
	const url = new URL(window.location.href);
	const examplePath = url.searchParams.get('id');
	if (examplePath) {
		const elements = examplePath.split('/');
		const exampleType = elements[0] as 'nodes' | 'expressions';
		switch (exampleType) {
			case 'nodes': {
				const context = elements[1];
				const exampleName = elements[2];
				const mapForContext = (examples.nodes as any)[context];
				if (!mapForContext) {
					return redirectToExamples();
				}
				const example = mapForContext[exampleName] as () => SceneBuilderResult;
				if (!example) {
					return redirectToExamples();
				}
				return loadExample(example());
			}
			case 'expressions': {
				return;
			}
		}
	}
	redirectToExamples();
}

function createExampleLinks() {
	const linkTemplate = document.getElementById('example-list-item-template');
	const linksParent = document.getElementById('examples-list');
	if (!(linkTemplate && linksParent)) {
		console.warn('templates not found');
		return;
	}
	const nodeContexts = Object.keys(examples.nodes);
	for (let context of nodeContexts) {
		const typeMap = (examples.nodes as any)[context];
		const exampleNames = Object.keys(typeMap);
		for (let exampleName of exampleNames) {
			const linkElement = linkTemplate.cloneNode(true) as HTMLElement;
			const aEl = linkElement.querySelector('a');
			if (!aEl) {
				console.warn('no a found');
				return;
			}
			console.log(linkElement, linkElement.childNodes, aEl);
			const examplePath = `/nodes/${context}/${exampleName}`;
			const url = `/examples?id=${encodeURI(examplePath)}`;
			aEl.setAttribute('href', url);
			linksParent.append();
		}
	}
	linkTemplate.remove();
}

document.addEventListener('DOMContentLoaded', () => {
	createExampleLinks();
	loadExampleData();
});
