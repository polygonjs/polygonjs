
#include <common>

varying float vViewZDepth;

// INSERT DEFINES



// /MAT/meshBasicBuilder1/param1
uniform vec3 v_POLY_param_myCustomVec;

// /MAT/meshBasicBuilder1/globals1
varying vec3 v_POLY_globals1_position;







void main() {

	// INSERT BODY



	// /MAT/meshBasicBuilder1/globals1
	v_POLY_globals1_position = vec3(position);
	
	// /MAT/meshBasicBuilder1/param1
	vec3 v_POLY_param1_val = v_POLY_param_myCustomVec;
	
	// /MAT/meshBasicBuilder1/add1
	vec3 v_POLY_add1_sum = (v_POLY_globals1_position + v_POLY_param1_val + vec3(0.0, 0.0, 0.0));
	
	// /MAT/meshBasicBuilder1/output1
	vec3 transformed = v_POLY_add1_sum;
	vec3 objectNormal = normal;
	#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
	#endif





	#include <project_vertex>

	vViewZDepth = - mvPosition.z;
}
