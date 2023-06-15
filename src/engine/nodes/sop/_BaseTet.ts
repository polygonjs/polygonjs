import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedSopNode} from './_Base';
import type {TetGeometry} from '../../../core/geometry/tet/TetGeometry';
import {TetObject} from '../../../core/geometry/tet/TetObject';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';
import {ModuleName} from '../../poly/registers/modules/Common';
export class TetSopNode<K extends NodeParamsConfig> extends TypedSopNode<K> {
	override dataType(): string {
		return CoreObjectType.TET;
	}
	override requiredModules() {
		return [ModuleName.TET];
	}
	setTetGeometry(geometry: TetGeometry) {
		const objects = [new TetObject(geometry)];
		this._setContainerTetObjects(objects);
	}
	setTetGeometries(geometries: TetGeometry[]) {
		const objects = geometries.map((g) => new TetObject(g));
		this._setContainerTetObjects(objects);
	}
	setTetObjects(tetObjects: TetObject[]) {
		this._setContainerTetObjects(tetObjects);
	}
	setTetObject(tetObject: TetObject) {
		this._setContainerTetObjects([tetObject]);
	}

	protected _setContainerTetObjects(objects: TetObject[] /*, message: MESSAGE*/) {
		const coreGroup = this.containerController.container().coreContent() || new CoreGroup();
		coreGroup.setAllObjects(objects);
		this._setContainer(coreGroup);
	}
}

export type BaseTetSopNodeType = TetSopNode<NodeParamsConfig>;
export class BaseTetSopNodeClass extends TetSopNode<NodeParamsConfig> {}
