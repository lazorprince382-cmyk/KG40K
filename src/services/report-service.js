"use strict";

function clean(value) {
  return String(value??"").replace(/[\u0000-\u001f]/g," ").replace(/[^\x20-\x7E]/g," ").trim();
}
function slug(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||"report";
}
function pdfEscape(value) {
  return clean(value).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
}
function wrap(value,width=105) {
  const text=clean(value);if(!text)return [""];
  const lines=[];for(let index=0;index<text.length;index+=width)lines.push(text.slice(index,index+width));return lines;
}
function pdfBuffer(title,columns,rows) {
  const lines=[clean(title),`Generated: ${new Date().toISOString()}`,"",columns.map(clean).join(" | ")];
  for(const row of rows)lines.push(...wrap(columns.map(column=>clean(row[column])).join(" | ")));
  const pages=[];for(let index=0;index<lines.length;index+=50)pages.push(lines.slice(index,index+50));
  const fontId=3+pages.length*2,objects=[];
  objects[1]="<< /Type /Catalog /Pages 2 0 R >>";
  objects[2]=`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_,i)=>`${3+i*2} 0 R`).join(" ")}] >>`;
  pages.forEach((page,index)=>{
    const pageId=3+index*2,contentId=pageId+1;
    const commands=`BT\n/F1 9 Tf\n40 800 Td\n13 TL\n${page.map(line=>`(${pdfEscape(line)}) Tj T*`).join("\n")}\nET`;
    objects[pageId]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId]=`<< /Length ${Buffer.byteLength(commands,"ascii")} >>\nstream\n${commands}\nendstream`;
  });
  objects[fontId]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  let output="%PDF-1.4\n",offsets=[0];
  for(let id=1;id<objects.length;id++){offsets[id]=Buffer.byteLength(output,"ascii");output+=`${id} 0 obj\n${objects[id]}\nendobj\n`;}
  const xref=Buffer.byteLength(output,"ascii");output+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for(let id=1;id<objects.length;id++)output+=`${String(offsets[id]).padStart(10,"0")} 00000 n \n`;
  output+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(output,"ascii");
}
function xmlEscape(value) {
  return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
function spreadsheetXml(title,columns,rows) {
  const rowXml=(values,style="")=>`<Row>${values.map(value=>`<Cell${style?` ss:StyleID="${style}"`:""}><Data ss:Type="${typeof value==="number"?"Number":"String"}">${xmlEscape(value)}</Data></Cell>`).join("")}</Row>`;
  return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#D9EAD3" ss:Pattern="Solid"/></Style></Styles>
<Worksheet ss:Name="Report"><Table>${rowXml([title],"Header")}${rowXml([`Generated ${new Date().toISOString()}`])}${rowXml(columns,"Header")}${rows.map(row=>rowXml(columns.map(column=>row[column]))).join("")}</Table></Worksheet></Workbook>`;
}
function sendReport(res,{title,columns,rows,format,inline=false}) {
  if(format==="pdf") {
    if(inline) {
      res.type("application/octet-stream");
      res.setHeader("X-Document-Mime-Type","application/pdf");
      res.setHeader("Cache-Control","no-store");
    } else res.type("application/pdf").attachment(`${slug(title)}.pdf`);
    res.send(pdfBuffer(title,columns,rows));
  } else {
    res.attachment(`${slug(title)}.xml`);
    res.set("Content-Type","application/vnd.ms-excel; charset=utf-8").send(spreadsheetXml(title,columns,rows));
  }
}
module.exports={sendReport};
