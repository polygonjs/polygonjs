uniform float size;
uniform float scale;
#include <common>

varying float vViewZDepth;

// INSERT DEFINES



// /MAT/pointsBuilder1/param1
uniform vec3 v_POLY_param_myCustomVec;

// /MAT/pointsBuilder1/globals1
varying vec3 v_POLY_globals1_position;







void main() {

	// INSERT BODY



	// /MAT/pointsBuilder1/globals1
	v_POLY_globals1_position = vec3(position);
	
	// /MAT/pointsBuilder1/add1
	vec3 v_POLY_add1_sum = (v_POLY_globals1_position + v_POLY_param_myCustomVec + vec3(0.0, 0.0, 0.0));
	
	// /MAT/pointsBuilder1/output1
	vec3 transformed = v_POLY_add1_sum;
	vec3 objectNormal = normal;
	#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
	#endif
	gl_PointSize = 1.0 * size * 10.0;





	#include <project_vertex>

	vViewZDepth = - mvPosition.z;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif

}

