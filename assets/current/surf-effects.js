/* Surf-owned fixed particle pool and bounded rewind composite. Layer 0 only. */
(function () {
  'use strict';
  class SurfEffects {
    constructor(T, scene, mobile, overlay) {
      this.T=T;this.scene=scene;this.mobile=mobile;this.size=new T.Vector2();this.count=mobile?64:128;this.cursor=0;this.serial=0;
      this.positions=new Float32Array(this.count*3);this.colors=new Float32Array(this.count*3);this.life=new Float32Array(this.count);
      this.velocity=new Float32Array(this.count*3);this.overlay=overlay;this.emission=0;this.mode='';
      this.geometry=new T.BufferGeometry();
      this.geometry.setAttribute('position',new T.BufferAttribute(this.positions,3).setUsage(T.DynamicDrawUsage));
      this.geometry.setAttribute('color',new T.BufferAttribute(this.colors,3).setUsage(T.DynamicDrawUsage));
      this.geometry.setAttribute('life',new T.BufferAttribute(this.life,1).setUsage(T.DynamicDrawUsage));
      this.material=new T.ShaderMaterial({
        transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexColors:true,
        vertexShader:'attribute float life; varying float vLife; varying vec3 vTint; void main(){vLife=life;vTint=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(110./max(1.,-p.z),2.,18.);gl_Position=projectionMatrix*p;}',
        fragmentShader:'varying float vLife; varying vec3 vTint; void main(){float r=length(gl_PointCoord-.5);if(r>.5||vLife<=0.)discard;gl_FragColor=vec4(vTint,(1.-r*2.)*vLife*.8);#include <colorspace_fragment>\n}'
      });
      // Keep preprocessor directives on their own line.
      this.material.fragmentShader=this.material.fragmentShader.replace(';#include',';\n#include');
      this.points=new T.Points(this.geometry,this.material);this.points.frustumCulled=false;scene.add(this.points);
      this.target=new T.WebGLRenderTarget(4,4,{depthBuffer:true,stencilBuffer:false});
      this.postScene=new T.Scene();this.postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
      this.postMaterial=new T.ShaderMaterial({
        depthTest:false,depthWrite:false,
        uniforms:{image:{value:this.target.texture},time:{value:0},amount:{value:0},encoded:{value:0},resolution:{value:new T.Vector2(4,4)}},
        vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
        fragmentShader:`uniform sampler2D image;uniform float time,amount,encoded;uniform vec2 resolution;varying vec2 vUv;
          void main(){float row=floor(vUv.y*80.);float tear=step(.96,fract(sin(row*8.17+floor(time*24.))*437.13));
            vec2 uv=clamp(vUv+vec2(tear*sin(time*73.+row)*.018*amount,0.),.001,.999);
            float split=(.0025+tear*.006)*amount;vec3 col;
            col.r=texture2D(image,clamp(uv+vec2(split,0.),.001,.999)).r;
            col.g=texture2D(image,uv).g;col.b=texture2D(image,clamp(uv-vec2(split,0.),.001,.999)).b;
            col*=1.-(.045+.035*sin(vUv.y*resolution.y*3.14159))*amount;
            col+=vec3(.025,.015,.045)*amount;gl_FragColor=vec4(col,1.);
            #include <colorspace_fragment>
            if(encoded>.5)gl_FragColor=vec4(col,1.);
          }`
      });
      this.postGeometry=new T.PlaneGeometry(2,2);this.postScene.add(new T.Mesh(this.postGeometry,this.postMaterial));
    }
    resize(renderer) {
      const size=renderer.getDrawingBufferSize(this.size),scale=Math.min(1,(this.mobile?960:1280)/size.x,(this.mobile?540:720)/size.y);
      const w=Math.max(4,Math.floor(size.x*scale)),h=Math.max(4,Math.floor(size.y*scale));
      if(this.target.width!==w||this.target.height!==h){this.target.setSize(w,h);this.postMaterial.uniforms.resolution.value.set(w,h);}
    }
    update(dt,p,yaw,enabled) {
      const mode=enabled?(p.dash>0?'dash':p.phase>0?'phase':''):'';
      if(mode!==this.mode){this.mode=mode;if(this.overlay)this.overlay.dataset.mode=mode;}
      this.points.visible=enabled;
      if(!enabled)return;
      let alive=0;for(let i=0;i<this.count;i++){if(this.life[i]<=0)continue;this.life[i]=Math.max(0,this.life[i]-dt*1.8);if(this.life[i]>0)alive++;for(let k=0;k<3;k++)this.positions[i*3+k]+=this.velocity[i*3+k]*dt;}
      this.emission=mode?Math.min(6,this.emission+Math.max(0,dt)*(this.mobile?60:100)):0;
      const emit=Math.floor(this.emission);this.emission-=emit;
      if(mode)for(let j=0;j<emit;j++){
        const i=this.cursor++%this.count,k=i*3,s=++this.serial,side=s%2?1:-1,phase=p.phase>0;
        const angle=s*2.399963,ring=phase?.65:.27;
        this.positions[k]=p.x+Math.cos(yaw)*1.4-Math.sin(yaw)*side*.38+Math.cos(angle)*ring;
        this.positions[k+1]=p.y+.9+Math.sin(angle)*.25;
        this.positions[k+2]=p.z+Math.sin(yaw)*1.4+Math.cos(yaw)*side*.38+Math.sin(angle)*ring;
        this.velocity[k]=-p.vx*.12;this.velocity[k+1]=phase?.5:0;this.velocity[k+2]=-p.vz*.12;
        this.colors[k]=phase?.5:.2;this.colors[k+1]=phase?.12:.85;this.colors[k+2]=phase?.95:1;this.life[i]=1;
      }
      this.points.visible=alive>0||emit>0;const a=this.geometry.attributes;a.position.needsUpdate=a.color.needsUpdate=a.life.needsUpdate=true;
    }
    copyTexture(renderer,texture,target){
      if(!this.copyMaterial){const T=this.T;this.copyMaterial=new T.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{image:{value:texture}},vertexShader:this.postMaterial.vertexShader,fragmentShader:"uniform sampler2D image;varying vec2 vUv;void main(){gl_FragColor=texture2D(image,vUv);}"});this.copyScene=new T.Scene();this.copyScene.add(new T.Mesh(this.postGeometry,this.copyMaterial));}
      this.copyMaterial.uniforms.image.value=texture;renderer.setRenderTarget(target);renderer.render(this.copyScene,this.postCamera);
    }
    composite(renderer,time,encoded=false) {
      this.postMaterial.uniforms.encoded.value=encoded?1:0;this.postMaterial.uniforms.image.value=this.target.texture;
      this.postMaterial.uniforms.time.value=time;this.postMaterial.uniforms.amount.value=1;
      renderer.setRenderTarget(null);renderer.render(this.postScene,this.postCamera);
    }
    clear(){this.life.fill(0);this.emission=0;this.mode='';if(this.overlay)this.overlay.dataset.mode='';this.geometry.attributes.life.needsUpdate=true;this.points.visible=false;}
    dispose(){this.clear();this.scene.remove(this.points);this.geometry.dispose();this.material.dispose();this.target.dispose();this.postGeometry.dispose();this.postMaterial.dispose();this.copyMaterial?.dispose();this.overlay=null;}
  }
  window.ElementalSurfEffects=SurfEffects;
})();
