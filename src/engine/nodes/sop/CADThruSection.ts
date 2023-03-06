// /**
//  * creates a loft surface from wires
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {CadObjectType, cadObjectTypeFromShape} from '../../../core/geometry/cad/CadCommon';
// import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';

// class ThruSectionCadParamsConfig extends NodeParamsConfig {
// 	/** @param solid */
// 	solid = ParamConfig.BOOLEAN(true);
// 	/** @param ruled is set to true if the faces generated between the edges of two consecutive wires are ruled surfaces or to false (the default value) if they are smoothed out by approximation */
// 	ruled = ParamConfig.BOOLEAN(true);
// 	/** @param precision is computed using `1 / 10 ** precision`. Therefore, 3 will be 1/1000, 4 will be 1/10000 and so on. */
// 	precision = ParamConfig.INTEGER(3, {
// 		range: [1, 6],
// 		rangeLocked: [true, false],
// 	});
// 	/** @param checking inputs compatibility */
// 	checkCompatibility = ParamConfig.BOOLEAN(true);
// }
// const ParamsConfig = new ThruSectionCadParamsConfig();

// export class ThruSectionCadNode extends TypedCadNode<ThruSectionCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'thruSection';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = await CadLoader.core();
// 		const inputCoreGroup = inputCoreGroups[0];

// 		const inputWireObjects = inputCoreGroup.objectsWithType(CadObjectType.WIRE);
// 		const newObjects: CadCoreObject<CadObjectType>[] = [];
// 		const isSolid = this.pv.solid;
// 		const ruled = this.pv.ruled;
// 		const precision3d = 1 / 10 ** this.pv.precision;
// 		// console.log(precision3d);
// 		const api = new oc.BRepOffsetAPI_ThruSections(isSolid, ruled, precision3d);
// 		for (let inputWireObject of inputWireObjects) {
// 			const wire = inputWireObject.object();
// 			api.AddWire(wire);
// 			// console.log('add', wire);
// 			// traverseEdges(oc, wire, (edge) => console.log(edge));
// 		}
// 		api.CheckCompatibility(this.pv.checkCompatibility);

// 		// console.log('done', api.IsDone());
// 		// IsDone seems useless, as it is falsed, but the shape still exists
// 		// if (api.IsDone()) {
// 		const newShape = api.Shape();
// 		const type = cadObjectTypeFromShape(oc, newShape);
// 		if (type) {
// 			newObjects.push(new CadCoreObject(newShape, type));
// 		} else {
// 			console.log('no type', newShape);
// 		}
// 		// }
// 		this.setCadObjects(newObjects);
// 	}
// }
