// /**
//  * Creates a CubeCamera
//  *
//  *	@remarks
//  *
//  * A Cube Camera is rendering the scene 6 times, once for each side of a cube. Those renders are then combined to create a texture which can be used as environment map.
//  *
//  * See the [OBJ/CubeCamera](https://polygonjs.com/docs/nodes/obj/CubeCamera) on how to use it as a texture.
//  */

// import {Constructor} from '../../../types/GlobalTypes';
// import {Group} from 'three';
// import {TransformController, TransformedParamConfig} from './utils/TransformController';
// import {TypedObjNode} from './_Base';
// import {ObjType} from '../../poly/registers/nodes/types/Obj';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {HierarchyController} from './utils/HierarchyController';
// import {FlagsControllerD} from '../utils/FlagsController';
// import {CubeCameraSopOperation, CubeCameraExtended} from '../../operations/sop/CubeCamera';
// import {CameraNodeType} from '../../poly/NodeContext';
// import {CUBE_CAMERA_DEFAULT, registerCubeCamera} from '../../../core/camera/CoreCubeCamera';
// import {OnNodeRegisterCallback} from '../../poly/registers/nodes/NodesRegister';
// const DEFAULT = CubeCameraSopOperation.DEFAULT_PARAMS;

// export function CubeCameraParamConfig<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		main = ParamConfig.FOLDER();
// 		/** @param camera near */
// 		near = ParamConfig.FLOAT(DEFAULT.near, {
// 			range: [0, 100],
// 			rangeLocked: [true, false],
// 		});
// 		/** @param camera far */
// 		far = ParamConfig.FLOAT(DEFAULT.far, {
// 			range: [0, 100],
// 			rangeLocked: [true, false],
// 		});
// 		/** @param resolution */
// 		resolution = ParamConfig.FLOAT(CUBE_CAMERA_DEFAULT.resolution, {range: CUBE_CAMERA_DEFAULT.resolutionRange});
// 		/** @param show helper */
// 		showHelper = ParamConfig.BOOLEAN(DEFAULT.showHelper);
// 		/** @param matrixAutoUpdate */
// 		matrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.matrixAutoUpdate);
// 		/** @param camera name */
// 		name = ParamConfig.STRING('`$OS`');
// 	};
// }

// class CubeCameraObjParamsConfig extends CubeCameraParamConfig(TransformedParamConfig(NodeParamsConfig)) {}
// const ParamsConfig = new CubeCameraObjParamsConfig();
// export class CubeCameraObjNode extends TypedObjNode<Group, CubeCameraObjParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return ObjType.CUBE_CAMERA;
// 	}
// 	override readonly hierarchyController: HierarchyController = new HierarchyController(this);
// 	override readonly transformController: TransformController = new TransformController(this);
// 	public override readonly flags: FlagsControllerD = new FlagsControllerD(this);

// 	static override onRegister: OnNodeRegisterCallback = registerCubeCamera;
// 	override initializeNode() {
// 		this.hierarchyController.initializeNode();
// 		this.transformController.initializeNode();

// 		this.io.inputs.setCount(0, 1);
// 	}

// 	private _cubeCamera: CubeCameraExtended | undefined;
// 	override createObject() {
// 		const group = new Group();
// 		this._cubeCamera = CubeCameraSopOperation.createCamera(this.pv, this);
// 		group.add(this._cubeCamera);
// 		return group;
// 	}

// 	override cook() {
// 		this.transformController.update();

// 		this.object.name = `${this.name()}-Container`;

// 		if (this._cubeCamera) {
// 			this._cubeCamera.name = this.pv.name || CameraNodeType.CUBE;
// 			CubeCameraSopOperation.updateCamera(this._cubeCamera, this.pv);
// 		}

// 		this.cookController.endCook();
// 	}
// }
