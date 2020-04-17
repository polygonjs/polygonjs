import {CATEGORY_OBJ} from './Category';

import {AmbientLightObjNode} from '../../../nodes/obj/AmbientLight';
import {AreaLightObjNode} from '../../../nodes/obj/AreaLight';
import {DirectionalLightObjNode} from '../../../nodes/obj/DirectionalLight';
import {HemisphereLightObjNode} from '../../../nodes/obj/HemisphereLight';
import {PointLightObjNode} from '../../../nodes/obj/PointLight';
import {SpotLightObjNode} from '../../../nodes/obj/SpotLight';

import {EventsObjNode} from '../../../nodes/obj/Events';
import {MaterialsObjNode} from '../../../nodes/obj/Materials';
import {CopObjNode} from '../../../nodes/obj/Cop';
import {PostProcessObjNode} from '../../../nodes/obj/PostProcess';

import {BlendObjNode} from '../../../nodes/obj/Blend';
import {GeoObjNode} from '../../../nodes/obj/Geo';
import {NullObjNode} from '../../../nodes/obj/Null';
import {RivetObjNode} from '../../../nodes/obj/Rivet';
import {SceneObjNode} from '../../../nodes/obj/Scene';

import {OrthographicCameraObjNode} from '../../../nodes/obj/OrthographicCamera';
import {PerspectiveCameraObjNode} from '../../../nodes/obj/PerspectiveCamera';
// import {CubeCameraObj} from '../../nodes/obj/CubeCamera';

export interface ObjNodeChildrenMap {
	ambient_light: AmbientLightObjNode;
	area_light: AreaLightObjNode;
	blend: BlendObjNode;
	cop: CopObjNode;
	directional_light: DirectionalLightObjNode;
	events: EventsObjNode;
	geo: GeoObjNode;
	hemisphere_light: HemisphereLightObjNode;
	materials: MaterialsObjNode;
	null: NullObjNode;
	orthographic_camera: OrthographicCameraObjNode;
	perspective_camera: PerspectiveCameraObjNode;
	point_light: PointLightObjNode;
	post_process: PostProcessObjNode;
	rivet: RivetObjNode;
	scene: SceneObjNode;
	spot_light: SpotLightObjNode;
}

import {Poly} from '../../../Poly';
export class ObjRegister {
	static run(poly: Poly) {
		poly.register_node(AmbientLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(AreaLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(DirectionalLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(HemisphereLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(PointLightObjNode, CATEGORY_OBJ.LIGHT);
		poly.register_node(SpotLightObjNode, CATEGORY_OBJ.LIGHT);

		poly.register_node(EventsObjNode, CATEGORY_OBJ.MANAGER);
		poly.register_node(MaterialsObjNode, CATEGORY_OBJ.MANAGER);
		poly.register_node(CopObjNode, CATEGORY_OBJ.MANAGER);
		poly.register_node(PostProcessObjNode, CATEGORY_OBJ.MANAGER);

		poly.register_node(BlendObjNode, CATEGORY_OBJ.TRANSFORM);
		poly.register_node(GeoObjNode, CATEGORY_OBJ.GEOMETRY);
		poly.register_node(NullObjNode, CATEGORY_OBJ.TRANSFORM);
		poly.register_node(RivetObjNode, CATEGORY_OBJ.TRANSFORM);
		poly.register_node(SceneObjNode, CATEGORY_OBJ.ADVANCED);

		poly.register_node(OrthographicCameraObjNode, CATEGORY_OBJ.CAMERA);
		poly.register_node(PerspectiveCameraObjNode, CATEGORY_OBJ.CAMERA);
		// poly.register_node(CubeCameraObj, CATEGORY_OBJ.CAMERA)
	}
}
