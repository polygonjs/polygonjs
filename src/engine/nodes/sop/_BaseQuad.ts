import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedSopNode} from './_Base';
import type {QuadGeometry} from '../../../core/geometry/quad/QuadGeometry';
import {QuadObject} from '../../../core/geometry/quad/QuadObject';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';
import {ModuleName} from '../../poly/registers/modules/Common';
export class QuadSopNode<K extends NodeParamsConfig> extends TypedSopNode<K> {
	override dataType(): string {
		return CoreObjectType.QUAD;
	}
	override requiredModules() {
		return [ModuleName.QUAD];
	}
	setQuadGeometry(geometry: QuadGeometry) {
		const objects = [new QuadObject(geometry)];
		this._setContainerQuadObjects(objects);
	}
	setQuadGeometries(geometries: QuadGeometry[]) {
		const objects = geometries.map((g) => new QuadObject(g));
		this._setContainerQuadObjects(objects);
	}
	setQuadObjects(quadObjects: QuadObject[]) {
		this._setContainerQuadObjects(quadObjects);
	}
	setQuadObject(quadObject: QuadObject) {
		this._setContainerQuadObjects([quadObject]);
	}

	protected _setContainerQuadObjects(objects: QuadObject[] /*, message: MESSAGE*/) {
		const coreGroup = this.containerController.container().coreContent() || new CoreGroup();
		coreGroup.setAllObjects(objects);
		this._setContainer(coreGroup);
	}
}

export type BaseCSGSopNodeType = QuadSopNode<NodeParamsConfig>;
export class BaseCSGSopNodeClass extends QuadSopNode<NodeParamsConfig> {}
