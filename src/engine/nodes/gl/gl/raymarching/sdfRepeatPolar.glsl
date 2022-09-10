
/*
SDF Repeat in polar coordinates
*/
// vec3 SDFRepeatPolar( vec3 p, in vec3 c )
// {
// 	vec3 polar = cartesianToPolar(p);
// 	polar.x = SDFRepeat(polar.x, c.x);
// 	polar.y = SDFRepeat(polar.y, c.y);
// 	polar.z = SDFRepeat(polar.z, c.z);
// 	return polarToCartesian(polar);
// }
// vec3 SDFRepeatPolarX( vec3 p, in vec3 c )
// {
// 	vec3 polar = cartesianToPolar(p);
// 	polar.x = SDFRepeat(polar.x, c.x);
// 	return polarToCartesian(polar);
// }
// vec3 SDFRepeatPolarY( vec3 p, in vec3 c )
// {
// 	vec3 polar = cartesianToPolar(p);
// 	polar.y = SDFRepeat(polar.y, c.y);
// 	return polarToCartesian(polar);
// }
vec3 SDFRepeatPolarZ( in vec3 p, in float c )
{
	vec3 polar = cartesianToPolar(p);
	polar.z = SDFRepeat(polar.z, c);
	return polarToCartesian(polar);
}
// vec3 SDFRepeatPolarXY( vec3 p, in vec3 c )
// {
// 	vec3 polar = cartesianToPolar(p);
// 	polar.x = SDFRepeat(polar.x, c.x);
// 	polar.y = SDFRepeat(polar.y, c.y);
// 	return polarToCartesian(polar);
// }
// vec3 SDFRepeatPolarXZ( vec3 p, in vec3 c )
// {
// 	vec3 polar = cartesianToPolar(p);
// 	polar.x = SDFRepeat(polar.x, c.x);
// 	polar.z = SDFRepeat(polar.z, c.z);
// 	return polarToCartesian(polar);
// }
// vec3 SDFRepeatPolarYZ( vec3 p, in vec3 c )
// {
// 	vec3 polar = cartesianToPolar(p);
// 	polar.y = SDFRepeat(polar.y, c.y);
// 	polar.z = SDFRepeat(polar.z, c.z);
// 	return polarToCartesian(polar);
// }