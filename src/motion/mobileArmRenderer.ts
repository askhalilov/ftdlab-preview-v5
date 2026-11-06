/** Bilinear source sampling keeps the original sleeve highlights continuous.
 * No render loop: GSAP requests a draw only during each gesture. The field is
 * neutral over the frame/face and blends through the original sleeve. */
export function createMobileArmRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement, map: HTMLImageElement, onLost: () => void) {
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:true})
  if(!gl||!image.naturalWidth||!map.naturalWidth)return
  const vertex='attribute vec2 position; varying vec2 uv; void main(){uv=(position+1.0)*.5;gl_Position=vec4(position,0.,1.);}'
  const fragment=`precision highp float; varying vec2 uv; uniform sampler2D original; uniform sampler2D field; uniform float amount;
    void main(){vec4 f=texture2D(field,uv);vec2 d=(f.rg*(255.0/256.0)-.5)*16.0*amount/vec2(630.,790.);
    if(f.b<=0.0) discard;
    vec4 color=texture2D(original,uv+vec2(d.x,-d.y)); float alpha=color.a*f.b;
    gl_FragColor=vec4(color.rgb*alpha,alpha);}`
  const shaders: WebGLShader[]=[],textures: WebGLTexture[]=[]
  const program=gl.createProgram(),buffer=gl.createBuffer()
  if(!program||!buffer)return
  function shader(type:number,source:string){const s=gl!.createShader(type);if(!s)throw Error('No shader');shaders.push(s);gl!.shaderSource(s,source);gl!.compileShader(s);if(!gl!.getShaderParameter(s,gl!.COMPILE_STATUS))throw Error('Arm shader unavailable');return s}
  let lost=false,disposed=false
  function cleanup(){textures.forEach(t=>gl!.deleteTexture(t));shaders.forEach(s=>gl!.deleteShader(s));gl!.deleteBuffer(buffer);gl!.deleteProgram(program)}
  try{
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program)
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Arm program unavailable')
    gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false)
    for(const[i,img]of[image,map].entries()){
      const t=gl.createTexture();if(!t)throw Error('Arm texture unavailable');textures.push(t)
      gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
      // Displacement channels are numerical data, not display colors.
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,i===0?gl.BROWSER_DEFAULT_WEBGL:gl.NONE)
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img)
      gl.uniform1i(gl.getUniformLocation(program,i===0?'original':'field'),i)
    }
  }catch{cleanup();return}
  const amount=gl.getUniformLocation(program,'amount')
  const ratio=Math.min(devicePixelRatio||1,2),rect=canvas.getBoundingClientRect()
  canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));gl.viewport(0,0,canvas.width,canvas.height)
  const contextLost=(event:Event)=>{event.preventDefault();lost=true;onLost()}
  canvas.addEventListener('webglcontextlost',contextLost)
  return{
    render(value:number){
      if(disposed||lost)return
      gl.useProgram(program);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(amount,value);gl.drawArrays(gl.TRIANGLES,0,6)
    },
    // The Vue canvas can survive replay/resize. Release owned GPU resources
    // without permanently losing that reusable context. The browser releases
    // the context itself when Vue removes its canvas on unmount.
    dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',contextLost);cleanup();if(!lost){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)}},
  }
}
