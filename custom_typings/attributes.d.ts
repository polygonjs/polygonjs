// attrib
type NumericAttribValueAsArray = Number2 | Number3 | Number4;
type NumericAttribValueAsVectorLike = Vector2Like | Vector3Like | Vector4Like | ColorLike;
type NumericAttribValue = number | NumericAttribValueAsVectorLike | NumericAttribValueAsArray;
type AttribValue = string | NumericAttribValue | boolean;
