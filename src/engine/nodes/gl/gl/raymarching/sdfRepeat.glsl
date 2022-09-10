
/*
SDF Repeat in cartesian coordinates
*/
float SDFRepeat( in float p, in float c )
{
	return mod(p+0.5*c,c)-0.5*c;
}
vec3 SDFRepeat( in vec3 p, in vec3 c )
{
	return mod(p+0.5*c,c)-0.5*c;
}
vec3 SDFRepeatX( in vec3 p, in vec3 c ){
	return vec3(
		SDFRepeat(p.x, c.x),
		p.yz
	);
}
vec3 SDFRepeatY( in vec3 p, in vec3 c ){
	return vec3(
		p.x,
		SDFRepeat(p.y, c.y),
		p.z
	);
}
vec3 SDFRepeatZ( in vec3 p, in vec3 c ){
	return vec3(
		p.xy,
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatXY( in vec3 p, in vec3 c ){
	return vec3(
		SDFRepeat(p.x, c.x),
		SDFRepeat(p.y, c.y),
		p.z
	);
}
vec3 SDFRepeatXZ( in vec3 p, in vec3 c ){
	return vec3(
		SDFRepeat(p.x, c.x),
		p.z,
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatYZ( in vec3 p, in vec3 c ){
	return vec3(
		p.x,
		SDFRepeat(p.y, c.y),
		SDFRepeat(p.z, c.z)
	);
}
