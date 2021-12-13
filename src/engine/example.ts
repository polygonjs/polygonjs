import {PolyDictionary} from '../types/GlobalTypes';
import {PolyScene} from './scene/PolyScene';
import {BaseNodeType} from './nodes/_Base';
import {PerspectiveCameraObjNode} from './nodes/obj/PerspectiveCamera';

import {AllRegister} from './poly/registers/All';
AllRegister.run();
// anim
import {AnimPosition} from '../../examples/engine/nodes/anim/Position';
import AnimPositionHTML from '../../examples/engine/nodes/anim/Position.html';
// mat
import {MatMeshBasic} from '../../examples/engine/nodes/mat/MeshBasic';
import {MatMeshLambert} from '../../examples/engine/nodes/mat/MeshLambert';
// sop
import {SopAdd} from '../../examples/engine/nodes/sop/Add';
import {SopAdd_createLine} from '../../examples/engine/nodes/sop/Add.create_line';
import {SopAttribAddMult} from '../../examples/engine/nodes/sop/AttribAddMult';
import SopAttribAddMultHTML from '../../examples/engine/nodes/sop/AttribAddMult.html';
import {SopAttribCopy} from '../../examples/engine/nodes/sop/AttribCopy';
import SopAttribCopyHTML from '../../examples/engine/nodes/sop/AttribCopy.html';
import {SopAttribCreate} from '../../examples/engine/nodes/sop/AttribCreate';
import SopAttribCreateHTML from '../../examples/engine/nodes/sop/AttribCreate.html';
import {SopBlend} from '../../examples/engine/nodes/sop/Blend';
import SopBlendHTML from '../../examples/engine/nodes/sop/Blend.html';
import {SopBox} from '../../examples/engine/nodes/sop/Box';
import {SopFile} from '../../examples/engine/nodes/sop/File';
import SopInstanceHTML from '../../examples/engine/nodes/sop/Instance.html';
import {SopInstance} from '../../examples/engine/nodes/sop/Instance';
import {SopNoise} from '../../examples/engine/nodes/sop/Noise';
import SopNoiseHTML from '../../examples/engine/nodes/sop/Noise.html';
import {SopRoundedBox} from '../../examples/engine/nodes/sop/RoundedBox';
import SopRoundedBoxHTML from '../../examples/engine/nodes/sop/RoundedBox.html';
import {SopSphere} from '../../examples/engine/nodes/sop/Sphere';
import SopSphereHTML from '../../examples/engine/nodes/sop/Sphere.html';
import {SopSphereIcosahedron} from '../../examples/engine/nodes/sop/Sphere.icosahedron';
import SopSphereIcosahedronHTML from '../../examples/engine/nodes/sop/Sphere.icosahedron.html';
import {SopSubdivide} from '../../examples/engine/nodes/sop/Subdivide';
import SopSubdivideHTML from '../../examples/engine/nodes/sop/Subdivide.html';
import {SopSwitch} from '../../examples/engine/nodes/sop/Switch';
import SopSwitchHTML from '../../examples/engine/nodes/sop/Switch.html';
import {SopTetrahedron} from '../../examples/engine/nodes/sop/Tetrahedron';
import SopTetrahedronHTML from '../../examples/engine/nodes/sop/Tetrahedron.html';
import {SopTorus} from '../../examples/engine/nodes/sop/Torus';
import {SopTorusKnot} from '../../examples/engine/nodes/sop/TorusKnot';
import SopTorusKnotHTML from '../../examples/engine/nodes/sop/TorusKnot.html';
// expressions
import {ExpressionBbox} from '../../examples/engine/expressions/bbox';
import ExpressionBboxHTML from '../../examples/engine/expressions/bbox.html';
import {ExpressionCentroid} from '../../examples/engine/expressions/centroid';
import ExpressionCentroidHTML from '../../examples/engine/expressions/centroid.html';

import {CoreType} from '../core/Type';

const examples = {
	nodes: {
		anim: {
			Position: [AnimPosition, AnimPositionHTML],
		},
		mat: {
			MeshBasic: MatMeshBasic,
			MeshLambert: MatMeshLambert,
		},
		sop: {
			Add: SopAdd,
			Add_createLine: SopAdd_createLine,
			AttribAddMult: [SopAttribAddMult, SopAttribAddMultHTML],
			AttribCopy: [SopAttribCopy, SopAttribCopyHTML],
			AttribCreate: [SopAttribCreate, SopAttribCreateHTML],
			Blend: [SopBlend, SopBlendHTML],
			Box: [SopBox],
			File: SopFile,
			Instance: [SopInstance, SopInstanceHTML],
			Noise: [SopNoise, SopNoiseHTML],
			RoundedBox: [SopRoundedBox, SopRoundedBoxHTML],
			Sphere: [SopSphere, SopSphereHTML],
			SphereIcosahedron: [SopSphereIcosahedron, SopSphereIcosahedronHTML],
			Subdivide: [SopSubdivide, SopSubdivideHTML],
			Switch: [SopSwitch, SopSwitchHTML],
			Tetrahedron: [SopTetrahedron, SopTetrahedronHTML],
			Torus: SopTorus,
			TorusKnot: [SopTorusKnot, SopTorusKnotHTML],
		},
	},
	expressions: {
		bbox: [ExpressionBbox, ExpressionBboxHTML],
		centroid: [ExpressionCentroid, ExpressionCentroidHTML],
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

function redirectToExample() {
	window.location.href = '/example';
}

function loadExample(example: SceneBuilderResult) {
	(window as any).scene = example.scene;

	const htmlNodes = example.htmlNodes;
	if (htmlNodes) {
		for (let k of Object.keys(htmlNodes)) {
			(window as any)[k] = htmlNodes[k];
		}
	}

	example.camera.createViewer({element: document.getElementById('app')!});
}

type ExampleMethod = () => SceneBuilderResult;
type ExampleNameContent = ExampleMethod | [ExampleMethod, string];
function loadExampleData() {
	const url = new URL(window.location.href);
	const examplePath = url.searchParams.get('id');

	function load(exampleContent?: ExampleNameContent) {
		if (!exampleContent) {
			return redirectToExample();
		}
		if (CoreType.isArray(exampleContent)) {
			const example = exampleContent[0];
			const html = exampleContent[1];
			addExampleHTML(html);
			return loadExample(example());
		} else {
			const example = exampleContent;
			return loadExample(example());
		}
	}

	if (examplePath) {
		const elements = examplePath.split('/');
		const exampleType = elements[0] as 'nodes' | 'expressions';
		switch (exampleType) {
			case 'nodes': {
				const context = elements[1];
				const nodeType = elements[2];
				const mapForContext = (examples.nodes as any)[context];
				if (!mapForContext) {
					return redirectToExample();
				}
				const exampleContent = mapForContext[nodeType] as ExampleNameContent;
				makeExampleLinkActive(nodeType);
				addSourceLink(`nodes/${context}/${nodeType}`);
				load(exampleContent);
				return;
			}
			case 'expressions': {
				const expressionName = elements[1];
				const exampleContent = (examples.expressions as any)[expressionName] as ExampleNameContent;
				makeExampleLinkActive(expressionName);
				addSourceLink(`expressions/${expressionName}`);
				load(exampleContent);
				return;
			}
		}
		redirectToExample();
	}
}

function addSourceLink(examplePath: string) {
	const linkEl = document.getElementById('source-link');
	if (!linkEl) {
		return;
	}
	const url = `https://github.com/polygonjs/polygonjs-engine/blob/master/examples/engine/${examplePath}.ts`;
	linkEl.setAttribute('href', url);
}

function addExampleHTML(htmlContext: string) {
	const container = document.getElementById('controls-container-inner');
	if (!container) {
		return;
	}
	container.innerHTML = htmlContext;
}

function makeExampleLinkActive(exampleName: string) {
	const selector = `li[data-example-name=${exampleName}]`;
	const elemNode = document.querySelector(selector);
	if (!elemNode) {
		return;
	}
	elemNode.classList.add('active');
}
function createExampleLinks() {
	const linkTemplate = document.getElementById('example-list-item-template');
	const linksParent = document.getElementById('examples-list');
	if (!(linkTemplate && linksParent)) {
		console.warn('templates not found');
		return;
	}
	// nodes
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
			const examplePath = `nodes/${context}/${exampleName}`;
			const url = `/example?id=${encodeURI(examplePath)}`;
			linkElement.setAttribute('data-example-name', exampleName);
			aEl.setAttribute('href', url);
			aEl.innerText = examplePath;
			linksParent.append(linkElement);
		}
	}
	// expressions
	const expressionNames = Object.keys(examples.expressions);
	for (let expressionName of expressionNames) {
		const linkElement = linkTemplate.cloneNode(true) as HTMLElement;
		const aEl = linkElement.querySelector('a');
		if (!aEl) {
			console.warn('no a found');
			return;
		}
		const examplePath = `expressions/${expressionName}`;
		const url = `/example?id=${encodeURI(examplePath)}`;
		linkElement.setAttribute('data-example-name', expressionName);
		aEl.setAttribute('href', url);
		aEl.innerText = examplePath;
		linksParent.append(linkElement);
	}

	// wrap
	linkTemplate.remove();
}

document.addEventListener('DOMContentLoaded', () => {
	createExampleLinks();
	loadExampleData();
});
