import {CATEGORY_OBJ} from './Category';

import {AmbientLightObjNode} from 'src/engine/nodes/obj/AmbientLight';
// import {AreaLight} from 'src/engine/nodes/obj/AreaLight';
// import {DirectionalLightObj} from 'src/engine/nodes/obj/DirectionalLight';
// import {HemisphereLightObj} from 'src/engine/nodes/obj/HemisphereLight';
// import {PointLightObj} from 'src/engine/nodes/obj/PointLight';
// import {SpotLightObj} from 'src/engine/nodes/obj/SpotLight';

import {EventsObjNode} from 'src/engine/nodes/obj/Events';
import {MaterialsObjNode} from 'src/engine/nodes/obj/Materials';
import {CopObjNode} from 'src/engine/nodes/obj/Cop';
import {PostProcessObjNode} from 'src/engine/nodes/obj/PostProcess';

import {GeoObjNode} from 'src/engine/nodes/obj/Geo';
// import {NullObjNode} from 'src/engine/nodes/obj/Null';
import {FogObjNode} from 'src/engine/nodes/obj/Fog';

import {OrthographicCameraObjNode} from 'src/engine/nodes/obj/OrthographicCamera';
import {PerspectiveCameraObjNode} from 'src/engine/nodes/obj/PerspectiveCamera';
// import {CubeCameraObj} from 'src/engine/nodes/obj/CubeCamera';

export interface ObjNodeChildrenMap {
	ambient_light: AmbientLightObjNode;
	cop: CopObjNode;
	events: EventsObjNode;
	fog: FogObjNode;
	geo: GeoObjNode;
	materials: MaterialsObjNode;
	perspective_camera: PerspectiveCameraObjNode;
	post_process: PostProcessObjNode;
	orthographic_camera: OrthographicCameraObjNode;
}

import {Poly} from 'src/engine/Poly';
export class ObjRegister {
	static run(poly: Poly) {
		poly.register_node(AmbientLightObjNode, CATEGORY_OBJ.LIGHT);
		// poly.register_node(AreaLight, CATEGORY_OBJ.LIGHT)
		// poly.register_node(DirectionalLightObj, CATEGORY_OBJ.LIGHT)
		// poly.register_node(HemisphereLightObj, CATEGORY_OBJ.LIGHT)
		// poly.register_node(PointLightObj, CATEGORY_OBJ.LIGHT)
		// poly.register_node(SpotLightObj, CATEGORY_OBJ.LIGHT)

		poly.register_node(EventsObjNode, CATEGORY_OBJ.MANAGER);
		poly.register_node(MaterialsObjNode, CATEGORY_OBJ.MANAGER);
		poly.register_node(CopObjNode, CATEGORY_OBJ.MANAGER);
		poly.register_node(PostProcessObjNode, CATEGORY_OBJ.MANAGER);

		poly.register_node(GeoObjNode, CATEGORY_OBJ.GEOMETRY);
		// poly.register_node(NullObjNode, CATEGORY_OBJ.GEOMETRY);

		poly.register_node(OrthographicCameraObjNode, CATEGORY_OBJ.CAMERA);
		poly.register_node(PerspectiveCameraObjNode, CATEGORY_OBJ.CAMERA);
		// poly.register_node(CubeCameraObj, CATEGORY_OBJ.CAMERA)

		poly.register_node(FogObjNode, CATEGORY_OBJ.MISC);
	}
}
