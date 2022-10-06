float luminance(vec3 col)
{
	const vec3 l = vec3(0.2125, 0.7154, 0.0721);
	return dot(col, l);
}