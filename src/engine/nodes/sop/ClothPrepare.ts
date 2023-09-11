/**
 * Prepares a geometry for cloth simulation.
 *
 *
 */
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {ClothGeometryAttributeName} from '../../../core/cloth/ClothAttribute';
import {TypedSopNode} from './_Base';
import {mergeFaces} from '../../../core/geometry/operation/Fuse';
import {BufferAttribute, Mesh} from 'three';
import {FloatParam} from '../../params/Float';
import {Attribute} from '../../../core/geometry/Attribute';
import {populateAdjacency3, POPULATE_ADJACENCY_DEFAULT} from '../../../core/geometry/operation/Adjacency';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';

class ClothPrepareSopParamsConfig extends NodeParamsConfig {
	fuseDist = ParamConfig.FLOAT(0.001);
	viscosity = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
	spring = ParamConfig.FLOAT(2, {
		range: [0, 5],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
}
const ParamsConfig = new ClothPrepareSopParamsConfig();

export class ClothPrepareSopNode extends TypedSopNode<ClothPrepareSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.CLOTH_PREPARE {
		return SopType.CLOTH_PREPARE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const inputMeshes = coreGroup.threejsObjectsWithGeo() as Mesh[];

		for (let inputMesh of inputMeshes) {
			const geometry = inputMesh.geometry;
			if (!geometry) {
				return;
			}
			this._applyFuse(inputMesh);
			this._addIdAttribute(inputMesh);
			this._addViscosityAttribute(inputMesh);
			this._addSpringAttribute(inputMesh);
			this._addAdjacencyAttributes(inputMesh);
		}

		this.setCoreGroup(coreGroup);
	}
	private _applyFuse(mesh: Mesh) {
		mergeFaces(mesh.geometry, this.pv.fuseDist);
	}
	private async _addIdAttribute(mesh: Mesh) {
		const geometry = mesh.geometry;
		const positionAttrib = geometry.getAttribute(Attribute.POSITION);
		if (!positionAttrib) {
			return;
		}
		const pointsCount = positionAttrib.count;
		const idValues = new Array(pointsCount);
		for (let i = 0; i < pointsCount; i++) {
			idValues[i] = i;
		}
		const idArray = new Float32Array(idValues);
		geometry.setAttribute(Attribute.ID, new BufferAttribute(idArray, 1));
	}
	private async _addViscosityAttribute(mesh: Mesh) {
		await this._addFloatAttribute(mesh, this.p.viscosity, ClothGeometryAttributeName.VISCOSITY);
	}
	private async _addSpringAttribute(mesh: Mesh) {
		await this._addFloatAttribute(mesh, this.p.spring, ClothGeometryAttributeName.SPRING);
	}
	private async _addFloatAttribute(mesh: Mesh, param: FloatParam, attribName: ClothGeometryAttributeName) {
		const corePointClass = corePointClassFactory(mesh);
		// const coreGeometry = new CoreGeometry(mesh.geometry);
		if (param.hasExpression() && param.expressionController) {
			if (!corePointClass.hasAttrib(mesh, attribName)) {
				corePointClass.addNumericAttrib(mesh, attribName, 1, param.value);
			}

			// const geometry = coreGeometry.geometry();
			const attrib = corePointClass.attribute(mesh, attribName) as BufferAttribute;
			attrib.needsUpdate = true;
			const array = attrib.array as number[];
			const points = pointsFromObject(mesh);
			await param.expressionController.computeExpressionForPoints(points, (point, value: number) => {
				array[point.index()] = value;
			});
		} else {
			corePointClass.addNumericAttrib(mesh, attribName, 1, param.value);
		}
	}
	private _addAdjacencyAttributes(mesh: Mesh) {
		populateAdjacency3(mesh, POPULATE_ADJACENCY_DEFAULT);
	}
}
