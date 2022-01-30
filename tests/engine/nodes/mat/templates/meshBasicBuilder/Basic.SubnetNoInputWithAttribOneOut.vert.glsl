
#include <common>



// /MAT/meshBasicBuilder1/subnet1/attribute1
varying vec3 v_POLY_attribute_attrib1;

// /MAT/meshBasicBuilder1/subnet1/attribute1
attribute vec3 attrib1;




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



	// /MAT/meshBasicBuilder1/subnet1
	vec3 v_POLY_subnet1_attribute1_val = attrib1;
	v_POLY_attribute_attrib1 = vec3(attrib1);
	
	// /MAT/meshBasicBuilder1/attribute1
	v_POLY_attribute_attrib1 = vec3(attrib1);
	
	// /MAT/meshBasicBuilder1/output1
	vec3 transformed = position;
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
