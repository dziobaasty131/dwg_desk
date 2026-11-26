import {getDocument,GlobalWorkerOptions} from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc=new URL('pdf/pdf.worker.mjs',document.baseURI).href;

export class PdfUnderlay {
  constructor(canvas,viewer,redraw,report){this.canvas=canvas;this.viewer=viewer;this.redraw=redraw;this.report=report;this.sequence=0;}
  async open(bytes,signal){
    if(signal?.aborted)throw new DOMException("Otwieranie anulowane","AbortError");
    this.loading=getDocument({data:bytes.slice(),isEvalSupported:false,enableXfa:false,cMapUrl:new URL('pdf/cmaps/',document.baseURI).href,cMapPacked:true,standardFontDataUrl:new URL('pdf/standard_fonts/',document.baseURI).href,wasmUrl:new URL('pdf/wasm/',document.baseURI).href,iccUrl:new URL('pdf/iccs/',document.baseURI).href});
    const abort=()=>{this.loading.destroy().catch(()=>{});};signal?.addEventListener('abort',abort,{once:true});
    try{this.document=await this.loading.promise;if(this.document.numPages>1000)throw new Error('PDF przekracza limit 1000 stron.');return this.document;}
    catch(e){if(e.name==='PasswordException')throw new Error('PDF jest zabezpieczony hasłem. Otwórz kopię bez hasła.');throw e;}
    finally{signal?.removeEventListener('abort',abort);}
  }
  async setPage(number){
    const seq=++this.sequence;clearTimeout(this.timer);this.renderTask?.cancel();this.raster=null;
    const page=await this.document.getPage(number);if(seq!==this.sequence)return;
    this.page=page;this.number=number;this.viewport=page.getViewport({scale:1});await this.render(1.5,seq);
    return this.model();
  }
  model(){
    const {width:w,height:h}=this.viewport,points=[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}];
    return {format:'dxf',layers:{PDF:{name:'PDF',colorIndex:7,isVisible:true}},blocks:{},metadata:{pdf:true},warnings:[],entities:points.map((p,i)=>({type:'LINE',kind:'line',layer:'PDF',startPoint:p,endPoint:points[(i+1)%4]}))};
  }
  desiredScale(scale){const {width,height}=this.viewport;return Math.min(Math.max(.1,scale),8192/width,8192/height,Math.sqrt(16000000/(width*height)));}
  async render(scale,seq=this.sequence){
    if(!this.page)return;const page=this.page,target=this.desiredScale(scale);this.requestedScale=target;
    this.renderTask?.cancel();const canvas=document.createElement('canvas'),viewport=page.getViewport({scale:target});canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    const task=page.render({canvas,canvasContext:canvas.getContext('2d'),viewport,background:'#ffffff'});this.renderTask=task;
    try{await task.promise;if(seq!==this.sequence||this.renderTask!==task)return;this.raster=canvas;this.renderedScale=target;this.redraw();}
    catch(e){if(e.name!=='RenderingCancelledException')throw e;}
    finally{if(this.renderTask===task)this.renderTask=null;}
  }
  draw(width,height,dpr){
    if(!this.viewport||this.canvas.hidden)return;
    const canvas=this.canvas;if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#182127';ctx.fillRect(0,0,width,height);
    if(this.raster){const top=this.viewer.renderer.worldToScreen({x:0,y:this.viewport.height}),bottom=this.viewer.renderer.worldToScreen({x:this.viewport.width,y:0});ctx.drawImage(this.raster,top.x,top.y,bottom.x-top.x,bottom.y-top.y);}
    const desired=this.desiredScale(this.viewer.renderer.getViewState().scale*dpr);
    if(!this.renderTask&&(desired>this.renderedScale*1.4||desired<this.renderedScale/3)){clearTimeout(this.timer);const seq=this.sequence;this.timer=setTimeout(()=>{if(seq===this.sequence)this.render(desired,seq).catch(e=>this.report('Nie udało się odświeżyć strony PDF: '+e.message));},160);}
  }
  dispose(){this.sequence++;clearTimeout(this.timer);this.renderTask?.cancel();this.loading?.destroy().catch(()=>{});this.canvas.hidden=true;this.raster=null;this.page=null;this.viewport=null;}
}
