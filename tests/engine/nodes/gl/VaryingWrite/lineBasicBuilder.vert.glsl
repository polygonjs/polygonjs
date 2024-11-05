
uniform float scale;
attribute float lineDistance;

varying float vLineDistance;

#include <common>



// /geo1/materialsNetwork1/lineBasicBuilder1/varyingWrite1
varying vec3 ptColor;

// /geo1/materialsNetwork1/lineBasicBuilder1/attribute1
attribute float randomid;



#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>



	// /geo1/materialsNetwork1/lineBasicBuilder1/attribute1
	float v_POLY_attribute1_val = randomid;
	
	// /geo1/materialsNetwork1/lineBasicBuilder1/floatToVec3_1
	vec3 v_POLY_floatToVec3_1_vec3 = vec3(v_POLY_attribute1_val, 0.31, 0.24);
	
	// /geo1/materialsNetwork1/lineBasicBuilder1/varyingWrite1
	ptColor = v_POLY_floatToVec3_1_vec3;
	
	// /geo1/materialsNetwork1/lineBasicBuilder1/output1
	vec3 transformed = vec3( position );vec4 mvPosition = vec4( transformed, 1.0 ); gl_Position = projectionMatrix * modelViewMatrix * mvPosition;



	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
// removed:
//	#include <begin_vertex>
	#include <morphtarget_vertex>
// removed:
//	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>

}
