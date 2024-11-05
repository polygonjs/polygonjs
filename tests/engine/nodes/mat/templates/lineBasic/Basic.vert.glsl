
uniform float scale;
attribute float lineDistance;

varying float vLineDistance;

#include <common>



// /MAT/lineBasicBuilder1/globals1
varying vec3 v_POLY_globals1_position;



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



	// /MAT/lineBasicBuilder1/globals1
	v_POLY_globals1_position = vec3(position);
	
	// /MAT/lineBasicBuilder1/output1
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
