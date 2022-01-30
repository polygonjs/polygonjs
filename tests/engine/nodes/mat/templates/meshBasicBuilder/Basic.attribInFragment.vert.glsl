
#include <common>



// /MAT/meshBasicBuilder1/attribute1
varying vec2 v_POLY_attribute_uv;




#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>



	// /MAT/meshBasicBuilder1/attribute1
	vec2 v_POLY_attribute1_val = uv;
	v_POLY_attribute_uv = vec2(uv);
	
	// /MAT/meshBasicBuilder1/vec2ToFloat1
	float v_POLY_vec2ToFloat1_x = v_POLY_attribute1_val.x;
	float v_POLY_vec2ToFloat1_y = v_POLY_attribute1_val.y;
	
	// /MAT/meshBasicBuilder1/floatToVec3_1
	vec3 v_POLY_floatToVec3_1_vec3 = vec3(v_POLY_vec2ToFloat1_x, 0.0, v_POLY_vec2ToFloat1_y);
	
	// /MAT/meshBasicBuilder1/output1
	vec3 transformed = v_POLY_floatToVec3_1_vec3;
	vec3 objectNormal = normal;
	#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
	#endif




	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )

// removed:
//		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>

	#endif

// removed:
//	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>

}
