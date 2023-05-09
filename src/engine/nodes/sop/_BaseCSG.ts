import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedSopNode} from './_Base';
import type {CsgGeometry, CsgGeometryType, CsgTypeMap} from '../../../core/geometry/csg/CsgCommon';
import {CsgObject} from '../../../core/geometry/csg/CsgObject';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';
import {ModuleName} from '../../poly/registers/modules/Common';
export class CSGSopNode<K extends NodeParamsConfig> extends TypedSopNode<K> {
	override dataType(): string {
		return CoreObjectType.CSG;
	}
	override requiredModules() {
		return [ModuleName.CSG];
	}
	setCSGGeometry<T extends CsgGeometryType>(geometry: CsgTypeMap[T]) {
		const objects = [new CsgObject(geometry)];
		this._setContainerCadObjects(objects);
	}
	setCSGGeometries(geometries: CsgGeometry[]) {
		const objects = geometries.map((g) => new CsgObject(g));
		this._setContainerCadObjects(objects);
	}
	setCSGObjects(csgObjects: CsgObject<CsgGeometryType>[]) {
		this._setContainerCadObjects(csgObjects);
	}
	setCSGObject(csgObject: CsgObject<CsgGeometryType>) {
		this._setContainerCadObjects([csgObject]);
	}

	protected _setContainerCadObjects(objects: CsgObject<CsgGeometryType>[] /*, message: MESSAGE*/) {
		const coreGroup = this.containerController.container().coreContent() || new CoreGroup();
		coreGroup.setAllObjects(objects);
		this._setContainer(coreGroup);
	}
}

export type BaseCSGSopNodeType = CSGSopNode<NodeParamsConfig>;
export class BaseCSGSopNodeClass extends CSGSopNode<NodeParamsConfig> {}
