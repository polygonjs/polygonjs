/**
 * Updates points/primitives with JS nodes
 *
 *
 */

import {Object3D, Vector3} from 'three';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {EntityBuilderPersistedConfig} from '../js/code/assemblers/entityBuilder/EntityBuilderPersistedConfig';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {BaseEntityBuilderSopNode, BaseEntityBuilderSopParamsConfig, AVAILABLE_ENTITIES} from './_BaseEntityBuilder';
import {EntityBuilderEvaluator} from '../js/code/assemblers/entityBuilder/EntityBuilderEvaluator';
import {EntityContainer} from '../js/code/assemblers/entityBuilder/EntityBuilderAssemblerCommon';
import {Attribute} from '../../../core/geometry/Attribute';
import {ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/Type';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {corePointClassFactory, corePrimitiveClassFactory} from '../../../core/geometry/CoreObjectFactory';
import {AttribClass} from '../../../core/geometry/Constant';

const _tmpObject = new Object3D();

class EntityBuilderSopParamsConfig extends BaseEntityBuilderSopParamsConfig {
	/** @param updateNormals */
	updateNormals = ParamConfig.BOOLEAN(1, {
		visibleIf: {
			entity: AVAILABLE_ENTITIES.indexOf(AttribClass.POINT),
		},
	});
}
const ParamsConfig = new EntityBuilderSopParamsConfig();
export class EntityBuilderSopNode extends BaseEntityBuilderSopNode<EntityBuilderSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ENTITY_BUILDER;
	}

	override readonly persisted_config: EntityBuilderPersistedConfig = new EntityBuilderPersistedConfig(this);
	public override usedAssembler(): Readonly<AssemblerName.JS_ENTITY_BUILDER> {
		return AssemblerName.JS_ENTITY_BUILDER;
	}

	protected _entityContainer: EntityContainer = {
		object: _tmpObject,
		position: new Vector3(),
		normal: new Vector3(),
		index: -1,
		objnum: -1,
		normalsUpdated: false,
	};

	protected _processObject<T extends CoreObjectType>(
		object: ObjectContent<T>,
		objnum: number,
		evaluator: EntityBuilderEvaluator
	) {
		this._entityContainer.object = object;
		this._entityContainer.objnum = objnum;
		this._entityContainer.normalsUpdated = false;
		if (this.entity() == AttribClass.PRIMITIVE) {
			// TODO: the graph should only be created if the js nodes require it
			this._entityContainer.primitiveGraph = corePrimitiveClassFactory(object).graph(object);
			//
		} else {
			this._entityContainer.primitiveGraph = undefined;
		}
		const readAttributeOptions = this._checkRequiredReadAttributes(object);
		const writeAttributeOptions = this._checkRequiredWriteAttributes(object);
		const readAttribNames = readAttributeOptions ? readAttributeOptions.attribNames : [];
		const readAttributeByName = readAttributeOptions ? readAttributeOptions.attributeByName : new Map();
		const attribTypeByName = readAttributeOptions ? readAttributeOptions.attribTypeByName : new Map();
		const writeAttribNames = writeAttributeOptions ? writeAttributeOptions.attribNames : [];
		const writeAttributeByName = writeAttributeOptions ? writeAttributeOptions.attributeByName : new Map();
		this._resetRequiredAttributes();
		const entitiesCount = this.entitiesCount(object);
		const entityClass = this.entityClass(object);
		const positionAttrib = entityClass.attribute(object, Attribute.POSITION);
		const normalAttrib = entityClass.attribute(object, Attribute.NORMAL);
		const hasPosition = positionAttrib != null;
		const hasNormal = normalAttrib != null;
		if (!hasPosition) {
			this._entityContainer.position.set(0, 0, 0);
		}
		if (!hasNormal) {
			this._entityContainer.normal.set(0, 1, 0);
		}
		for (let index = 0; index < entitiesCount; index++) {
			this._entityContainer.index = index;
			// read attributes
			if (hasPosition) {
				entityClass.attribValue(object, index, Attribute.POSITION, this._entityContainer.position);
				// this._entityContainer.position.fromBufferAttribute(positionAttrib, index);
			}
			if (hasNormal) {
				entityClass.attribValue(object, index, Attribute.NORMAL, this._entityContainer.normal);
				// this._entityContainer.normal.fromBufferAttribute(normalAttrib, index);
			}
			this._readRequiredAttributes(index, readAttribNames, readAttributeByName, attribTypeByName);
			// eval function
			evaluator();
			// write back
			// if (hasPosition) {
			// 	positionAttrib.setXYZ(
			// 		index,
			// 		this._entityContainer.position.x,
			// 		this._entityContainer.position.y,
			// 		this._entityContainer.position.z
			// 	);
			// }
			// if (hasNormal) {
			// 	normalAttrib.setXYZ(
			// 		index,
			// 		this._entityContainer.normal.x,
			// 		this._entityContainer.normal.y,
			// 		this._entityContainer.normal.z
			// 	);
			// }
			this._writeRequiredAttributes(index, writeAttribNames, writeAttributeByName);
		}
		if (isBooleanTrue(this.pv.updateNormals) && !this._entityContainer.normalsUpdated) {
			corePointClassFactory(object).computeNormals(object);
		}
	}
}
