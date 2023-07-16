/**
 * Updates points with JS nodes
 *
 *
 */

import {Vector3, BufferAttribute} from 'three';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {PointBuilderPersistedConfig} from '../js/code/assemblers/pointBuilder/PointBuilderPersistedConfig';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {BasePointBuilderSopNode} from './_BasePointBuilder';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {PointBuilderEvaluator} from '../js/code/assemblers/pointBuilder/PointBuilderEvaluator';
import {PointContainer} from '../js/code/assemblers/pointBuilder/PointBuilderAssemblerCommon';
import {Object3DWithGeometry} from '../../../core/geometry/Group';
import {Attribute} from '../../../core/geometry/Attribute';

export class PointBuilderSopNode extends BasePointBuilderSopNode {
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
	}
}
