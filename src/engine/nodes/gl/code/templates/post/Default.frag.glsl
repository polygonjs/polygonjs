
// INSERT DEFINE

uniform sampler2D textureInput1;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec4 diffuseColor = vec4(0.0,0.0,0.0,1.0);


	// INSERT BODY

	outputColor = vec4( diffuseColor );

}