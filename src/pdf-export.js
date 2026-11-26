import {PDFDocument,rgb,degrees,pushGraphicsState,popGraphicsState,concatTransformationMatrix} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {validateDesign,pathLength,pointOnPath,objectColor} from '../shared/design-model.js';
import {cadExportColor} from '../shared/cad-export.js';
import {pageToPdfMatrix,pdfLength} from '../shared/pdf-model.js';

export async function exportPdf(bytes,entries,fontBytes){
  const pdf=await PDFDocument.load(bytes.slice());pdf.registerFontkit(fontkit);
  const font=await pdf.embedFont(fontBytes,{subset:true});
  for(const entry of entries){
    const design=validateDesign(entry.design),page=pdf.getPage(entry.number-1),matrix=pageToPdfMatrix(entry.viewport);
    page.pushOperators(pushGraphicsState(),concatTransformationMatrix(...matrix));
    for(const o of design.objects){
      const layer=design.layers.find(l=>l.id===o.layerId);if(!layer.visible)continue;
      const hex=cadExportColor(objectColor(o,layer),'white'),channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),color=rgb(...channels);
      const line=(a,b,width=1.1)=>page.drawLine({start:a,end:b,thickness:width,color});
      const poly=(points,closed=false,width=1.1)=>{for(let i=1;i<points.length;i++)line(points[i-1],points[i],width);if(closed&&points.length>1)line(points.at(-1),points[0],width);};
      const circle=(p,r)=>page.drawCircle({x:p.x,y:p.y,size:r,borderWidth:1.1,borderColor:color});
      const text=(p,value,size=8,rotation=0)=>page.drawText(String(value).replace(/[\r\n]/g,' '),{x:p.x,y:p.y,size,font,color,rotate:degrees(rotation)});
      if(o.kind==='cable'){
        poly(o.points,false,1.4);
        for(const flag of o.flags){const label=`${o.name} · ${pdfLength(pathLength(o.points),design.settings)}`,size=8,w=font.widthOfTextAtSize(label,size)+8;line(pointOnPath(o.points,flag.ratio),flag.position,.7);page.drawRectangle({x:flag.position.x-4,y:flag.position.y-3,width:w,height:13,color:rgb(1,1,1),borderColor:color,borderWidth:.6});text(flag.position,label,size);}
      }else if(o.kind==='symbol'){
        const a=o.rotation*Math.PI/180,transform=p=>({x:o.position.x+o.size*(Math.cos(a)*p.x-Math.sin(a)*p.y),y:o.position.y+o.size*(Math.sin(a)*p.x+Math.cos(a)*p.y)});
        if(o.symbol.kind==='camera'&&o.showFov&&o.range){const sector=[o.position];for(let i=0;i<=64;i++){const angle=(o.rotation-o.fov/2+o.fov*i/64)*Math.PI/180;sector.push({x:o.position.x+Math.cos(angle)*o.range,y:o.position.y+Math.sin(angle)*o.range});}poly(sector,true,.5);}
        for(const s of o.symbol.strokes){if(s.type==='circle')circle(transform(s.center),s.radius*o.size);else poly(s.points.map(transform),s.closed);}
        text({x:o.position.x,y:o.position.y+o.size+4},o.name);
      }else if(o.kind==='point'){circle(o.position,o.size);line({x:o.position.x-o.size*1.5,y:o.position.y},{x:o.position.x+o.size*1.5,y:o.position.y});line({x:o.position.x,y:o.position.y-o.size*1.5},{x:o.position.x,y:o.position.y+o.size*1.5});text({x:o.position.x+o.size*2,y:o.position.y+4},o.name);}
      else if(o.kind==='text')text(o.position,o.name,o.size,o.rotation);
    }
    page.pushOperators(popGraphicsState());
  }
  pdf.setProducer('DWG Desk');return pdf.save();
}
