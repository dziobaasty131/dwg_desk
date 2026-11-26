import {UNITS} from '../src/units.js';

export const METERS_PER_PDF_POINT=.0254/72;
export function calibrationFactor(distance,meters){
  if(!Number.isFinite(distance)||distance<=1e-8||!Number.isFinite(meters)||meters<=0)throw new Error('Wskaż dwa różne punkty i podaj dodatnią długość.');
  const factor=meters/distance;
  if(factor<1e-10||factor>1e6)throw new Error('Skala jest poza obsługiwanym zakresem.');
  return factor;
}
export async function pdfPageKey(hash,page){
  if(!/^[a-f\d]{64}$/.test(hash)||!Number.isInteger(page)||page<1)throw new Error('Nieprawidłowa strona PDF.');
  const bytes=new TextEncoder().encode(`${hash}:pdf-page:${page}`);
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
}
// Map displayed, rotated/cropped page coordinates (Y up) back to PDF user space.
export function pageToPdfMatrix(viewport){
  const [a,b,c,d,e,f]=viewport.transform,det=a*d-b*c,h=viewport.height;
  if(!Number.isFinite(det)||Math.abs(det)<1e-12)throw new Error('Nieprawidłowy obrót strony PDF.');
  return [d/det,-b/det,c/det,-a/det,(-d*e-c*(h-f))/det,(b*e+a*(h-f))/det];
}
export function pdfLength(value,settings){
  const factor=settings.pdfMetersPerPoint,unit=settings.displayUnit||'m';
  return `${new Intl.NumberFormat('pl-PL',{maximumFractionDigits:3}).format(factor?value*factor/(UNITS[unit]?.meters||1):value)} ${factor?(UNITS[unit]?.label||'m'):'pkt PDF'}`;
}
