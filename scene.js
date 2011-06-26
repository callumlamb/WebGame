/*
 * Node
 */ 
function Node() {
	this._parent = null;
	this._children = [];
}
Node.prototype.add = function(node) {
	node._parent = this;
	this._children.push(node);
}

/*
 * RotationNode
 */
function RotationNode(angle, axis) {
	RotationNode.parent.constructor.apply(this, arguments);
	this.angle = angle;
	this.axis = axis;
}
extend(RotationNode, Node);
RotationNode.prototype.execute = function() {
	var copy = mat4.set(modelViewMatrix, mat4.create());
	mat4.rotate(modelViewMatrix, this.angle, this.axis);
	for(var a = 0; a < this._children.length; a++) this._children[a].execute();
	modelViewMatrix = copy;
}

/*
 * TranslationNode
 */
function TranslationNode(translation) {
	TranslationNode.parent.constructor.apply(this, arguments);
	this.translation = translation;
}
extend(TranslationNode, Node);
TranslationNode.prototype.execute = function() {
	var copy = mat4.set(modelViewMatrix, mat4.create());
	mat4.translate(modelViewMatrix, this.translation);
	for(var a = 0; a < this._children.length; a++) this._children[a].execute();
	modelViewMatrix = copy;
}

/*
 * EntityNode
 */
function EntityNode() {
	EntityNode.parent.constructor.apply(this, arguments);
	this.vertices = [0.0, 2.0, -7.0, -2.0, -2.0, -7.0, 2.0, -2.0, -7.0];
	this.buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
}
extend(EntityNode, Node);
EntityNode.prototype.execute = function() {
	var shaderProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	gl.uniformMatrix4fv(shaderProgram.modelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(shaderProgram.perspectiveMatrix, false, perspectiveMatrix);
	gl.vertexAttribPointer(shaderProgram.vertex, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
}

/*
 * ShaderNode
 */
function ShaderNode(program) {
	ShaderNode.parent.constructor.apply(this, arguments);
	this._program = program;
}
extend(ShaderNode, Node);
ShaderNode.prototype.execute = function() {
	var reference = gl.getParameter(gl.CURRENT_PROGRAM);
	if(reference != this._program) gl.useProgram(this._program);
	for(var a = 0; a < this._children.length; a++) this._children[a].execute();
	if(reference && reference != this._program) gl.useProgram(reference);
}
 
/*
 * Extend
 */
function extend(child, parent) {
	function F() {};
	F.prototype = parent.prototype;
	child.prototype = new F();
	child.prototype.constructor = child;
	child.parent = parent.prototype;
}