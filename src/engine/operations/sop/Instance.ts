import {Material, Mesh, BufferGeometry} from 'three';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {GlobalsGeometryHandler} from '../../../engine/nodes/gl/code/globals/Geometry';
import {objectTypeFromObject} from '../../../core/geometry/Constant';
import {applyCustomMaterials} from '../../../core/geometry/Material';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {BaseBuilderMatNodeType} from '../../../engine/nodes/mat/_BaseBuilder';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {SopType} from '../../poly/registers/nodes/types/Sop';

interface InstanceSopParams extends DefaultOperationParams {
	attributesToCopy: string;
	applyMaterial: boolean;
	material: TypedNodePathParamValue;
}

export class InstanceSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: InstanceSopParams = {
		attributesToCopy: 'instance*',
		applyMaterial: true,
		material: new TypedNodePathParamValue(''),
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.NEVER, InputCloneMode.NEVER];
	static override type(): Readonly<SopType.INSTANCE> {
		return SopType.INSTANCE;
	}

	private _globalsHandler: GlobalsGeometryHandler | undefined;
	private _geometry: BufferGeometry | undefined;

	override async cook(inputCoreGroups: CoreGroup[], params: InstanceSopParams) {
		const coreGroupToInstance = inputCoreGroups[0];
		this._geometry = undefined;

		const objectToInstance = coreGroupToInstance.threejsObjectsWithGeo()[0];
		if (objectToInstance) {
			const geometryToInstance = objectToInstance.geometry;
			if (geometryToInstance) {
				const coreGroup = inputCoreGroups[1];
				this._createInstance(geometryToInstance, coreGroup, params);
			}
		}

		if (this._geometry) {
			const type = objectTypeFromObject(objectToInstance);
			if (type) {
				const object = this.createObject(this._geometry, type);
				if (object) {
					if (isBooleanTrue(params.applyMaterial)) {
						const material = await this._getMaterial(params);
						if (material) {
							await this._applyMaterial(object as Mesh, material);
						}
					}

					return this.createCoreGroupFromObjects([object]);
				}
			}
		}
		return this.createCoreGroupFromObjects([]);
	}

	private async _getMaterial(params: InstanceSopParams) {
		if (isBooleanTrue(params.applyMaterial)) {
			const materialNode = params.material.nodeWithContext(NodeContext.MAT, this.states?.error);
			if (materialNode) {
				this._globalsHandler = this._globalsHandler || new GlobalsGeometryHandler();
				const matBuilderNode = materialNode as BaseBuilderMatNodeType;
				const matNodeAssemblerController = matBuilderNode.assemblerController();
				if (matNodeAssemblerController) {
					matNodeAssemblerController.setAssemblerGlobalsHandler(this._globalsHandler);
				}

				const container = await materialNode.compute();
				const material = container.material();
				return material;
			}
		}
	}

	async _applyMaterial(object: Mesh, material: Material) {
		object.material = material;
		applyCustomMaterials(object, material);
	}

	private _createInstance(
		geometryToInstance: BufferGeometry,
		templateCoreGroup: CoreGroup,
		params: InstanceSopParams
	) {
		this._geometry = CoreInstancer.createInstanceBufferGeometry(
			geometryToInstance,
			templateCoreGroup,
			params.attributesToCopy
		);
	}
}
