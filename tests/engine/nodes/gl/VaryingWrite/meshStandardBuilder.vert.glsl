
#define STANDARD

varying vec3 vViewPosition;

#ifdef USE_TRANSMISSION

	varying vec3 vWorldPosition;

#endif

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>



// /geo1/materialsNetwork1/meshStandardBuilder1/hsvToRgb1
// https://github.com/hughsk/glsl-hsv2rgb
// https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
vec3 hsv2rgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}







// /geo1/materialsNetwork1/meshStandardBuilder1/varyingWrite1
varying vec3 ptColor;

// /geo1/materialsNetwork1/meshStandardBuilder1/attribute1
attribute float randomId;




#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>



	// /geo1/materialsNetwork1/meshStandardBuilder1/attribute1
	float v_POLY_attribute1_val = randomId;
	
	// /geo1/materialsNetwork1/meshStandardBuilder1/multAdd2
	float v_POLY_multAdd2_val = (10000.0*(v_POLY_attribute1_val + 1.3)) + 0.0;
	
	// /geo1/materialsNetwork1/meshStandardBuilder1/floatToVec3_1
	vec3 v_POLY_floatToVec3_1_vec3 = vec3(v_POLY_multAdd2_val, 0.84, 0.47);
	
	// /geo1/materialsNetwork1/meshStandardBuilder1/output1
	vec3 transformed = position;
	vec3 objectNormal = normal;
	#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
	#endif
	
	// /geo1/materialsNetwork1/meshStandardBuilder1/hsvToRgb1
	vec3 v_POLY_hsvToRgb1_rgb = hsv2rgb(v_POLY_floatToVec3_1_vec3);
	
	// /geo1/materialsNetwork1/meshStandardBuilder1/varyingWrite1
	ptColor = v_POLY_hsvToRgb1_rgb;



	#include <morphcolor_vertex>
	#include <batching_vertex>

// removed:
//	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

// removed:
//	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

#ifdef USE_TRANSMISSION

	vWorldPosition = worldPosition.xyz;

#endif
}
