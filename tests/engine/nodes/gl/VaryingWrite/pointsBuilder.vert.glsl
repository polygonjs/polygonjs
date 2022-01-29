
uniform float size;
uniform float scale;

#include <common>



// /geo1/materialsNetwork1/pointsParticles_DEBUG/varyingWrite1
varying vec3 ptColor;

// /geo1/materialsNetwork1/pointsParticles_DEBUG/attribute1
attribute float randomid;




#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <color_vertex>



	// /geo1/materialsNetwork1/pointsParticles_DEBUG/constant_point_size
	float v_POLY_constant_point_size_val = 6.9;
	
	// /geo1/materialsNetwork1/pointsParticles_DEBUG/attribute1
	float v_POLY_attribute_randomid = randomid;
	
	// /geo1/materialsNetwork1/pointsParticles_DEBUG/output1
	vec3 transformed = position;
	vec3 objectNormal = normal;
	#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
	#endif
	gl_PointSize = v_POLY_constant_point_size_val * size * 10.0;
	
	// /geo1/materialsNetwork1/pointsParticles_DEBUG/floatToVec3_1
	vec3 v_POLY_floatToVec3_1_vec3 = vec3(v_POLY_attribute_randomid, 0.31, 0.24);
	
	// /geo1/materialsNetwork1/pointsParticles_DEBUG/varyingWrite1
	ptColor = v_POLY_floatToVec3_1_vec3;



// removed:
//	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>

// removed:
//	gl_PointSize = size;

	#ifdef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );

	#endif

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>

}
