
uniform vec3 diffuse;
uniform float opacity;

#include <common>



// /geo1/materialsNetwork1/pointsParticles_DEBUG/varyingRead1
varying vec3 ptColor;




#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );



	// /geo1/materialsNetwork1/pointsParticles_DEBUG/varyingRead1
	vec3 v_POLY_varyingRead1_fragment = ptColor;
	
	// /geo1/materialsNetwork1/pointsParticles_DEBUG/output1
	diffuseColor.xyz = v_POLY_varyingRead1_fragment;




	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>

	outgoingLight = diffuseColor.rgb;

	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>

}
