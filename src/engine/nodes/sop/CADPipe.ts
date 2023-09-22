/**
 * Creates a CAD Pipe, by sweeping a profile along a path.
 *
 *
 */

import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoaderSync} from '../../../core/geometry/modules/cad/CadLoaderSync';
import {CadObject} from '../../../core/geometry/modules/cad/CadObject';
import {
	cadDowncast,
	CadGC,
	CadGeometryType,
	cadGeometryTypeFromShape,
	TopoDS_Wire,
	TopoDS_Shape,
} from '../../../core/geometry/modules/cad/CadCommon';
import {cadFilterObjects} from '../../../core/geometry/modules/cad/utils/CadFilter';
import {CoreGroup} from '../../../core/geometry/Group';
import {isBooleanTrue} from '../../../core/Type';
import {CoreCadType} from '../../../core/geometry/modules/cad/CadCoreType';
import {cadWireFromEdge} from '../../../core/geometry/modules/cad/toObject3D/CadWire';

class CADPipeSopParamsConfig extends NodeParamsConfig {
	/** @param create caps */
	cap = ParamConfig.BOOLEAN(1);
	/** @param convert caps to faces */
	capsAsFaces = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new CADPipeSopParamsConfig();

export class CADPipeSopNode extends CADSopNode<CADPipeSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_PIPE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(2);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const oc = CadLoaderSync.oc();
		const profilesCoreGroup = inputCoreGroups[0];
		const pathsCoreGroup = inputCoreGroups[1];

		const newObjects: CadObject<CadGeometryType>[] = [];
		const profilesObjects = cadFilterObjects(profilesCoreGroup.cadObjects(), [
			CadGeometryType.VERTEX,
			CadGeometryType.EDGE,
			CadGeometryType.WIRE,
			CadGeometryType.FACE,
			CadGeometryType.SHELL,
		]);
		const pathObjects = cadFilterObjects(pathsCoreGroup.cadObjects(), [CadGeometryType.EDGE, CadGeometryType.WIRE]);
		if (profilesObjects && pathObjects) {
			CadGC.withGC((r) => {
				const minObjectsCount = Math.min(profilesObjects.length, pathObjects.length);
				for (let i = 0; i < minObjectsCount; i++) {
					const profileObject = profilesObjects[i];
					const pathObject = pathObjects[i];

					const wirePath = CoreCadType.isWire(pathObject)
						? pathObject.cadGeometry()
						: cadWireFromEdge(oc, pathObject.cadGeometry());
					const api = r(new oc.BRepOffsetAPI_MakePipe_1(wirePath, profileObject.cadGeometry()));
					if (api.IsDone()) {
						// api.Build(CadLoaderSync.Message_ProgressRange);
						// const pipe = api.Pipe();

						const shapes = [api.Shape()];
						if (isBooleanTrue(this.pv.cap)) {
							const addCap = (capShape: TopoDS_Shape | undefined, invert: boolean) => {
								if (!capShape) {
									return;
								}
								if (cadGeometryTypeFromShape(oc, capShape) == CadGeometryType.WIRE) {
									const wire = cadDowncast(oc, capShape) as TopoDS_Wire;
									if (isBooleanTrue(this.pv.capsAsFaces)) {
										const capApi = r(new oc.BRepBuilderAPI_MakeFace_15(wire, true));
										if (capApi.IsDone()) {
											const face = capApi.Face();
											shapes.push(invert ? face.Complemented() : face);
										}
									} else {
										shapes.push(capShape);
									}
								}
							};
							addCap(api.FirstShape(), true);
							addCap(api.LastShape(), false);
						}
						for (const shape of shapes) {
							const type = cadGeometryTypeFromShape(oc, shape);
							if (type) {
								const newObject = new CadObject(shape, type);
								newObjects.push(newObject);
							}
						}
					}
				}
			});
		}

		this.setCADObjects(newObjects);
	}
}
