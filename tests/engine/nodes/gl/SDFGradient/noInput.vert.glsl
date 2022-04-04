
#include <common>



// /MAT/meshBasicBuilder1/SDFGradient1
float v_POLY_SDFGradient1_sdfFunction(vec3 position){
	// /MAT/meshBasicBuilder1/SDFGradient1/subnetOutput1
	return 0.0;
}

vec3 v_POLY_SDFGradient1_gradientFunction( in vec3 p )
{
	const float eps = 0.0001;
	const vec2 h = vec2(eps,0);
	return normalize(
		vec3(
			v_POLY_SDFGradient1_sdfFunction(p+h.xyy) - v_POLY_SDFGradient1_sdfFunction(p-h.xyy),
			v_POLY_SDFGradient1_sdfFunction(p+h.yxy) - v_POLY_SDFGradient1_sdfFunction(p-h.yxy),
			v_POLY_SDFGradient1_sdfFunction(p+h.yyx) - v_POLY_SDFGradient1_sdfFunction(p-h.yyx)
		)
	);
}





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



	// /MAT/meshBasicBuilder1/SDFGradient1
	vec3 v_POLY_SDFGradient1_gradient = v_POLY_SDFGradient1_gradientFunction(vec3(0.0, 0.0, 0.0));
	
	// /MAT/meshBasicBuilder1/output1
	vec3 transformed = v_POLY_SDFGradient1_gradient;
	vec3 objectNormal = normal;
	#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
	#endif



	#include <morphcolor_vertex>

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
