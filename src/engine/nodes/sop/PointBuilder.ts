/**
 * Updates points with JS nodes
 *
 *
 */

import {Vector3, BufferAttribute} from 'three';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {PointBuilderPersistedConfig} from '../js/code/assemblers/pointBuilder/PointBuilderPersistedConfig';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {BasePointBuilderSopNode, BasePointBuilderSopParamsConfig} from './_BasePointBuilder';
import {PointBuilderEvaluator} from '../js/code/assemblers/pointBuilder/PointBuilderEvaluator';
import {PointContainer} from '../js/code/assemblers/pointBuilder/PointBuilderAssemblerCommon';
import {Object3DWithGeometry} from '../../../core/geometry/Group';
import {Attribute} from '../../../core/geometry/Attribute';
import {ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/Type';
import {pointsCountFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';

class PointBuilderSopParamsConfig extends BasePointBuilderSopParamsConfig {
	/** @param updateNormals */
	updateNormals = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new PointBuilderSopParamsConfig();
export class PointBuilderSopNode extends BasePointBuilderSopNode<PointBuilderSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.POINT_BUILDER;
	}

	override readonly persisted_config: PointBuilderPersistedConfig = new PointBuilderPersistedConfig(this);
	public override usedAssembler(): Readonly<AssemblerName.JS_POINT_BUILDER> {
		return AssemblerName.JS_POINT_BUILDER;
	}

	protected _pointContainer: PointContainer = {
		position: new Vector3(),
		normal: new Vector3(),
		ptnum: -1,
		objnum: -1,
		normalsUpdated: false,
	};

	protected _processObject<T extends CoreObjectType>(
		inputObject: Object3DWithGeometry,
		objnum: number,
		evaluator: PointBuilderEvaluator
	) {
		this._pointContainer.objnum = objnum;
		this._pointContainer.normalsUpdated = false;
		const geometry = inputObject.geometry;
		console.log({geometry});
		const readAttributeOptions = this._checkRequiredReadAttributes(inputObject);
		const writeAttributeOptions = this._checkRequiredWriteAttributes(inputObject);
		const readAttribNames = readAttributeOptions ? readAttributeOptions.attribNames : [];
		const readAttributeByName = readAttributeOptions ? readAttributeOptions.attributeByName : new Map();
		const attribTypeByName = readAttributeOptions ? readAttributeOptions.attribTypeByName : new Map();
		const writeAttribNames = writeAttributeOptions ? writeAttributeOptions.attribNames : [];
		const writeAttributeByName = writeAttributeOptions ? writeAttributeOptions.attributeByName : new Map();
		this._resetRequiredAttributes();
		const pointsCount = pointsCountFromObject(inputObject);
		const positionAttrib = geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
		const normalAttrib = geometry.getAttribute(Attribute.NORMAL) as BufferAttribute;
		const hasPosition = positionAttrib != null;
		const hasNormal = normalAttrib != null;
		if (!hasPosition) {
			this._pointContainer.position.set(0, 0, 0);
		}
		if (!hasNormal) {
			this._pointContainer.normal.set(0, 1, 0);
		}
		for (let ptnum = 0; ptnum < pointsCount; ptnum++) {
			this._pointContainer.ptnum = ptnum;
			// read attributes
			if (hasPosition) {
				this._pointContainer.position.fromBufferAttribute(positionAttrib, ptnum);
			}
			if (hasNormal) {
				this._pointContainer.normal.fromBufferAttribute(normalAttrib, ptnum);
			}
			this._readRequiredAttributes(ptnum, readAttribNames, readAttributeByName, attribTypeByName);
			// eval function
			evaluator();
			// write back
			if (hasPosition) {
				positionAttrib.setXYZ(
					ptnum,
					this._pointContainer.position.x,
					this._pointContainer.position.y,
					this._pointContainer.position.z
				);
			}
			if (hasNormal) {
				normalAttrib.setXYZ(
					ptnum,
					this._pointContainer.normal.x,
					this._pointContainer.normal.y,
					this._pointContainer.normal.z
				);
			}
			this._writeRequiredAttributes(ptnum, writeAttribNames, writeAttributeByName);
		}
		if (isBooleanTrue(this.pv.updateNormals) && !this._pointContainer.normalsUpdated) {
			geometry.computeVertexNormals();
		}
	}
}
