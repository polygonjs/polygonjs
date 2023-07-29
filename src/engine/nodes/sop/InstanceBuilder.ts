/**
 * Updates instance points with JS nodes
 *
 *
 */

import {Vector3, Quaternion, BufferAttribute} from 'three';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InstanceBuilderPersistedConfig} from '../js/code/assemblers/instanceBuilder/InstanceBuilderPersistedConfig';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {BasePointBuilderSopNode, BasePointBuilderSopParamsConfig} from './_BasePointBuilder';
import {PointBuilderEvaluator} from '../js/code/assemblers/pointBuilder/PointBuilderEvaluator';
import {InstanceContainer} from '../js/code/assemblers/instanceBuilder/InstanceBuilderAssemblerCommon';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {Object3DWithGeometry} from '../../../core/geometry/Group';
import {InstanceAttrib} from '../../../core/geometry/Instancer';

const ParamsConfig = new BasePointBuilderSopParamsConfig();
export class InstanceBuilderSopNode extends BasePointBuilderSopNode<BasePointBuilderSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.INSTANCE_BUILDER;
	}

	override readonly persisted_config: InstanceBuilderPersistedConfig = new InstanceBuilderPersistedConfig(this);
	public override usedAssembler(): Readonly<AssemblerName.JS_INSTANCE_BUILDER> {
		return AssemblerName.JS_INSTANCE_BUILDER;
	}

	protected _pointContainer: InstanceContainer = {
		instancePosition: new Vector3(),
		instanceQuaternion: new Quaternion(),
		instanceScale: new Vector3(),
		ptnum: -1,
		objnum: -1,
	};

	protected _processObject(inputObject: Object3DWithGeometry, objnum: number, evaluator: PointBuilderEvaluator) {
		this._pointContainer.objnum = objnum;
		const geometry = inputObject.geometry;
		const readAttributeOptions = this._checkRequiredReadAttributes(geometry);
		const writeAttributeOptions = this._checkRequiredWriteAttributes(geometry);
		const readAttribNames = readAttributeOptions ? readAttributeOptions.attribNames : [];
		const readAttributeByName = readAttributeOptions ? readAttributeOptions.attributeByName : new Map();
		const attribTypeByName = readAttributeOptions ? readAttributeOptions.attribTypeByName : new Map();
		const writeAttribNames = writeAttributeOptions ? writeAttributeOptions.attribNames : [];
		const writeAttributeByName = writeAttributeOptions ? writeAttributeOptions.attributeByName : new Map();
		this._resetRequiredAttributes();
		const pointsCount = CoreGeometry.pointsCount(geometry);
		const positionAttrib = geometry.getAttribute(InstanceAttrib.POSITION) as BufferAttribute;
		const quaternionAttrib = geometry.getAttribute(InstanceAttrib.QUATERNION) as BufferAttribute;
		const scaleAttrib = geometry.getAttribute(InstanceAttrib.SCALE) as BufferAttribute;
		const hasPosition = positionAttrib != null;
		const hasQuaternion = quaternionAttrib != null;
		const hasScale = scaleAttrib != null;
		if (!hasPosition) {
			this._pointContainer.instancePosition.set(0, 0, 0);
		}
		if (!hasQuaternion) {
			this._pointContainer.instanceQuaternion.identity();
		}
		if (!hasScale) {
			this._pointContainer.instanceScale.set(1, 1, 1);
		}
		for (let ptnum = 0; ptnum < pointsCount; ptnum++) {
			this._pointContainer.ptnum = ptnum;
			// read attributes
			if (hasPosition) {
				this._pointContainer.instancePosition.fromBufferAttribute(positionAttrib, ptnum);
			}
			if (hasQuaternion) {
				this._pointContainer.instanceQuaternion.fromBufferAttribute(quaternionAttrib, ptnum);
			}
			if (hasScale) {
				this._pointContainer.instanceScale.fromBufferAttribute(scaleAttrib, ptnum);
			}
			this._readRequiredAttributes(ptnum, readAttribNames, readAttributeByName, attribTypeByName);
			// eval function
			evaluator();
			// write back
			if (hasPosition) {
				positionAttrib.setXYZ(
					ptnum,
					this._pointContainer.instancePosition.x,
					this._pointContainer.instancePosition.y,
					this._pointContainer.instancePosition.z
				);
			}
			if (hasQuaternion) {
				quaternionAttrib.setXYZW(
					ptnum,
					this._pointContainer.instanceQuaternion.x,
					this._pointContainer.instanceQuaternion.y,
					this._pointContainer.instanceQuaternion.z,
					this._pointContainer.instanceQuaternion.w
				);
			}
			if (hasScale) {
				scaleAttrib.setXYZ(
					ptnum,
					this._pointContainer.instanceScale.x,
					this._pointContainer.instanceScale.y,
					this._pointContainer.instanceScale.z
				);
			}
			this._writeRequiredAttributes(ptnum, writeAttribNames, writeAttributeByName);
		}
	}
}
