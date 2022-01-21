
uniform vec3 diffuse;
uniform float opacity;

uniform float dashSize;
uniform float totalSize;

varying float vLineDistance;

#include <common>



// /geo1/materialsNetwork1/lineBasicBuilder1/varyingRead1
varying vec3 ptColor;




#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

	if ( mod( vLineDistance, totalSize ) > dashSize ) {

		discard;

	}

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );



	// /geo1/materialsNetwork1/lineBasicBuilder1/varyingRead1
	vec3 v_POLY_varyingRead1_fragment = ptColor;
	
	// /geo1/materialsNetwork1/lineBasicBuilder1/multAdd1
	vec3 v_POLY_multAdd1_val = (vec3(0.8, 1.2, 1.2)*(v_POLY_varyingRead1_fragment + vec3(0.0, 0.0, 0.0))) + vec3(0.0, 0.0, 0.0);
	
	// /geo1/materialsNetwork1/lineBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_multAdd1_val;




	#include <logdepthbuf_fragment>
	#include <color_fragment>

	outgoingLight = diffuseColor.rgb; // simple shader

	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>

}
