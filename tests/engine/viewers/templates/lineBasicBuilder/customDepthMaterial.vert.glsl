
uniform float scale;
attribute float lineDistance;

varying float vLineDistance;


#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

// INSERT DEFINES



// /MAT/lineBasicBuilder1/param1
uniform vec3 v_POLY_param_myCustomVec;

// /MAT/lineBasicBuilder1/globals1
varying vec3 v_POLY_globals1_position;






// vHighPrecisionZW is added to match CustomMeshDepth.frag
// which is itself taken from threejs
varying vec2 vHighPrecisionZW;


void main() {

	// INSERT BODY



	// /MAT/lineBasicBuilder1/globals1
	v_POLY_globals1_position = vec3(position);
	
	// /MAT/lineBasicBuilder1/param1
	vec3 v_POLY_param1_val = v_POLY_param_myCustomVec;
	
	// /MAT/lineBasicBuilder1/add1
	vec3 v_POLY_add1_sum = (v_POLY_globals1_position + v_POLY_param1_val + vec3(0.0, 0.0, 0.0));
	
	// /MAT/lineBasicBuilder1/output1
	vec3 transformed = v_POLY_add1_sum;vec4 mvPosition = vec4( transformed, 1.0 ); gl_Position = projectionMatrix * modelViewMatrix * mvPosition;





	vLineDistance = scale * lineDistance;

	#include <color_vertex>
// removed:
//	#include <begin_vertex>
	#include <morphtarget_vertex>
// removed:
//	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>


	vHighPrecisionZW = gl_Position.zw;
}
