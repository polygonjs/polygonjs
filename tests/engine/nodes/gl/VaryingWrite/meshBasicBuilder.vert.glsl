
#include <common>



// /geo1/materialsNetwork1/meshBasicBuilder1/hsvToRgb1
// https://github.com/hughsk/glsl-hsv2rgb
// https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
vec3 hsv2rgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}







// /geo1/materialsNetwork1/meshBasicBuilder1/varyingWrite1
varying vec3 ptColor;

// /geo1/materialsNetwork1/meshBasicBuilder1/attribute1
attribute float randomId;




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



	// /geo1/materialsNetwork1/meshBasicBuilder1/attribute1
	float v_POLY_attribute_randomId = randomId;
	
	// /geo1/materialsNetwork1/meshBasicBuilder1/floatToVec3_1
	vec3 v_POLY_floatToVec3_1_vec3 = vec3(v_POLY_attribute_randomId, 0.75, 0.75);
	
	// /geo1/materialsNetwork1/meshBasicBuilder1/hsvToRgb1
	vec3 v_POLY_hsvToRgb1_rgb = hsv2rgb(v_POLY_floatToVec3_1_vec3);
	
	// /geo1/materialsNetwork1/meshBasicBuilder1/output1
	vec3 transformed = position;
	vec3 objectNormal = normal;
	#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
	#endif
	
	// /geo1/materialsNetwork1/meshBasicBuilder1/varyingWrite1
	ptColor = v_POLY_hsvToRgb1_rgb;




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
