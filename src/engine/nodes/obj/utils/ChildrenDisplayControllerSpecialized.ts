import {Object3D, Color} from 'three';
import {DisplayNodeController} from '../../utils/DisplayNodeController';
import {ChildrenDisplayController} from './ChildrenDisplayController';

import {TesselationParamsObjNode} from './TesselationParams';
import {CoreGroup} from '../../../../core/geometry/Group';
import {CoreType} from '../../../../core/Type';
import type {CADTesselationParams} from '../../../../core/geometry/cad/CadCommon';
import type {CSGTesselationParams} from '../../../../core/geometry/csg/CsgCommon';

interface BaseObjNodeClassWithDisplayNode extends TesselationParamsObjNode {
	displayNodeController: DisplayNodeController;
	// pv: TesselationParams;
}
const CAD_TESSELATION_PARAMS: CADTesselationParams = {
	linearTolerance: 0,
	angularTolerance: 0,
	curveAbscissa: 0,
	curveTolerance: 0,
	wireframe: false,
	displayMeshes: false,
	displayEdges: false,
	meshesColor: new Color(),
	edgesColor: new Color(),
};

function updateCADTesselationParams(node: BaseObjNodeClassWithDisplayNode) {
	const pv = node.pv;
	CAD_TESSELATION_PARAMS.linearTolerance = pv.CADLinearTolerance;
	CAD_TESSELATION_PARAMS.angularTolerance = pv.CADAngularTolerance;
	CAD_TESSELATION_PARAMS.curveAbscissa = pv.CADCurveAbscissa;
	CAD_TESSELATION_PARAMS.curveTolerance = pv.CADCurveTolerance;
	//
	CAD_TESSELATION_PARAMS.wireframe = pv.CADWireframe;
	CAD_TESSELATION_PARAMS.displayMeshes = pv.CADDisplayMeshes;
	CAD_TESSELATION_PARAMS.displayEdges = pv.CADDisplayEdges;
	CAD_TESSELATION_PARAMS.meshesColor.copy(pv.CADMeshesColor);
	CAD_TESSELATION_PARAMS.edgesColor.copy(pv.CADEdgesColor);
}
const CSG_TESSELATION_PARAMS: CSGTesselationParams = {
	facetAngle: 0,
	wireframe: false,
	meshesColor: new Color(),
	linesColor: new Color(),
};
function updateCSGTesselationParams(node: BaseObjNodeClassWithDisplayNode) {
	const pv = node.pv;
	CSG_TESSELATION_PARAMS.facetAngle = pv.CSGFacetAngle;
	CSG_TESSELATION_PARAMS.wireframe = pv.CSGWireframe;
	CSG_TESSELATION_PARAMS.meshesColor.copy(pv.CSGMeshesColor);
	CSG_TESSELATION_PARAMS.linesColor.copy(pv.CSGLinesColor);
}

export class ChildrenDisplayControllerSpecialized extends ChildrenDisplayController {
	constructor(protected override node: BaseObjNodeClassWithDisplayNode) {
		super(node);
	}

	override _addSpecializedObjects(coreGroup: CoreGroup, newObjects: Object3D[]) {
		// CAD
		const newCadObjects = coreGroup.cadObjects();
		if (newCadObjects && newCadObjects.length != 0) {
			updateCADTesselationParams(this.node);
			for (let cadObject of newCadObjects) {
				const newObject3D = cadObject.toObject3D(CAD_TESSELATION_PARAMS);
				if (newObject3D) {
					this._newObjectsAreDifferent = true;
					if (CoreType.isArray(newObject3D)) {
						newObjects.push(...newObject3D);
					} else {
						newObjects.push(newObject3D);
					}
				}
			}
		}
		// CSG
		const newCsgObjects = coreGroup.csgObjects();
		if (newCsgObjects && newCsgObjects.length != 0) {
			updateCSGTesselationParams(this.node);
			for (let csgObject of newCsgObjects) {
				const newObject3D = csgObject.toObject3D(CSG_TESSELATION_PARAMS);
				if (newObject3D) {
					this._newObjectsAreDifferent = true;
					if (CoreType.isArray(newObject3D)) {
						newObjects.push(...newObject3D);
					} else {
						newObjects.push(newObject3D);
					}
				}
			}
		}
	}
}
