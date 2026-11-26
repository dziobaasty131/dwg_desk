const fs=require('node:fs/promises');const path=require('node:path');const {randomUUID}=require('node:crypto');
function pdfBytes(bytes){const b=Buffer.from(bytes||[]);if(!b.length||b.length>300*1024*1024||!b.subarray(0,1024).includes(Buffer.from('%PDF-')))throw new Error('Nieprawidłowy plik PDF.');return b;}
async function savePdf(file,payload,openedFiles=new Set()){
  const bytes=pdfBytes(payload.bytes),source=pdfBytes(payload.sourceBytes);
  async function protect(){const target=await fs.realpath(file).catch(()=>path.resolve(file));if(openedFiles.has(target))throw new Error('Wybierz nową nazwę. Zapis nie nadpisuje otwartego podkładu.');try{const stat=await fs.lstat(file);if(stat.isSymbolicLink()||!stat.isFile())throw new Error('Wybierz zwykły plik docelowy.');if(stat.size===source.length&&(await fs.readFile(file)).equals(source))throw new Error('Wybierz nową nazwę. Zapis nie nadpisuje oryginalnego PDF.');}catch(e){if(e.code!=='ENOENT')throw e;}}
  await protect();const temp=path.join(path.dirname(file),'.dwgdesk-'+randomUUID()+'.tmp');try{await fs.writeFile(temp,bytes,{flag:'wx',mode:0o600});await protect();await fs.rename(temp,file);}finally{await fs.rm(temp,{force:true});}return {fileName:path.basename(file)};
}
module.exports={pdfBytes,savePdf};
