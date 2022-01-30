
uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>

varying float vViewZDepth;

// INSERT DEFINES



// /MAT/lineBasicBuilder1/param1
uniform vec3 v_POLY_param_myCustomVec;

// /MAT/lineBasicBuilder1/globals1
varying vec3 v_POLY_globals1_position;







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
	gl_Position = projectionMatrix * mvPosition;

	vViewZDepth = - mvPosition.z;


}
