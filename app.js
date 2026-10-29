const $ = (id) => document.getElementById(id);
const canvas = $("previewCanvas");
const ctx = canvas.getContext("2d");
const controls = ["textInput","fontSelect","textColor","bgColor","backgroundMode","fontSize","letterSpacing","effectSelect","uppercase"];
let renderTimer;

function getSettings() {
  let text = $("textInput").value || " ";
  if ($("uppercase").checked) text = text.toUpperCase();
  return {
    text, font: $("fontSelect").value, color: $("textColor").value,
    bg: $("bgColor").value, background: $("backgroundMode").value,
    size: Number($("fontSize").value), spacing: Number($("letterSpacing").value),
    effect: $("effectSelect").value
  };
}
function roundedRect(x,y,w,h,r) {
  ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill();
}
function drawBackground(s) {
  if (s.background === "transparent") {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    return;
  }
  if (s.background === "solid") {
    ctx.fillStyle=s.bg; ctx.fillRect(0,0,canvas.width,canvas.height); return;
  }
  const g=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  g.addColorStop(0,s.bg); g.addColorStop(.55,"#171326"); g.addColorStop(1,"#090910");
  ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
  // Subtle ambient light and decorative corner lines
  const glow=ctx.createRadialGradient(600,335,5,600,335,520);
  glow.addColorStop(0,"rgba(167,139,250,.16)");glow.addColorStop(1,"rgba(167,139,250,0)");
  ctx.fillStyle=glow;ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle="rgba(255,255,255,.09)";ctx.lineWidth=2;
  ctx.strokeRect(34,34,canvas.width-68,canvas.height-68);
  ctx.strokeStyle="rgba(236,72,153,.5)";ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(34,105);ctx.lineTo(34,34);ctx.lineTo(105,34);ctx.stroke();
  ctx.beginPath();ctx.moveTo(canvas.width-105,canvas.height-34);ctx.lineTo(canvas.width-34,canvas.height-34);ctx.lineTo(canvas.width-34,canvas.height-105);ctx.stroke();
}
function measureLetterSpaced(text, font, spacing) {
  let width=0;
  for (const ch of text) width+=ctx.measureText(ch).width+spacing;
  return Math.max(0,width-spacing);
}
function splitLines(text, maxWidth, font, spacing) {
  const paragraphs=text.split("\n"), lines=[];
  for (const paragraph of paragraphs) {
    const words=paragraph.split(/\s+/); let line="";
    for (const word of words) {
      const test=line ? line+" "+word : word;
      if (line && measureLetterSpaced(test,font,spacing)>maxWidth) { lines.push(line); line=word; }
      else line=test;
      if (measureLetterSpaced(line,font,spacing)>maxWidth) {
        let part="";
        for(const ch of line) {
          if(part && measureLetterSpaced(part+ch,font,spacing)>maxWidth){lines.push(part);part=ch;}
          else part+=ch;
        }
        line=part;
      }
    }
    lines.push(line || " ");
  }
  return lines.slice(0,5);
}
function drawSpacedText(text, x, y, spacing) {
  let cursor=x;
  for(const ch of text) {ctx.fillText(ch,cursor,y);cursor+=ctx.measureText(ch).width+spacing;}
}
async function render() {
  const s=getSettings();
  const fontSpec=`${s.size}px "${s.font}"`;
  try { await document.fonts.load(fontSpec, s.text); } catch(e) {}
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBackground(s);
  const maxWidth=canvas.width-130;
  let size=s.size, font=`${size}px "${s.font}"`, lines;
  ctx.textAlign="left";ctx.textBaseline="middle";ctx.font=font;
  lines=splitLines(s.text,maxWidth,font,s.spacing);
  while(size>24 && lines.some(line=>measureLetterSpaced(line,font,s.spacing)>maxWidth)) {
    size-=3;font=`${size}px "${s.font}"`;ctx.font=font;
    lines=splitLines(s.text,maxWidth,font,s.spacing);
  }
  // Re-fit based on total line height.
  const lineHeight=size*1.25;
  if(lines.length*lineHeight>canvas.height-110) {
    size=Math.max(22,Math.floor((canvas.height-110)/(lines.length*1.25)));
    font=`${size}px "${s.font}"`;ctx.font=font;
  }
  const actualLineHeight=size*1.25;
  const totalHeight=lines.length*actualLineHeight;
  const startY=(canvas.height-totalHeight)/2+actualLineHeight/2;
  ctx.fillStyle=s.color;ctx.font=font;
  if(s.effect==="glow"){ctx.shadowColor=s.color;ctx.shadowBlur=Math.max(12,size*.22);}
  else if(s.effect==="shadow"){ctx.shadowColor="rgba(0,0,0,.85)";ctx.shadowBlur=14;ctx.shadowOffsetX=5;ctx.shadowOffsetY=7;}
  else {ctx.shadowColor="transparent";ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;}
  if(s.effect==="outline"){ctx.lineWidth=Math.max(2,size*.035);ctx.strokeStyle=s.color;ctx.lineJoin="round";}
  lines.forEach((line,i)=>{
    const width=measureLetterSpaced(line,font,s.spacing);
    const x=(canvas.width-width)/2, y=startY+i*actualLineHeight;
    if(s.effect==="outline") {
      let cursor=x;
      for(const ch of line){ctx.strokeText(ch,cursor,y);cursor+=ctx.measureText(ch).width+s.spacing;}
    } else drawSpacedText(line,x,y,s.spacing);
  });
  ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
  $("fontSample").style.fontFamily=`"${s.font}", sans-serif`;
  $("fontSample").textContent=s.text.replace(/\n/g," ");
  $("fontSample").style.color=s.color;
  $("charCount").textContent=`${$("textInput").value.length} / 120`;
  $("fontSizeValue").textContent=`${$("fontSize").value} px`;
  $("letterSpacingValue").textContent=`${$("letterSpacing").value} px`;
  $("textColorValue").textContent=s.color.toUpperCase();
  $("bgColorValue").textContent=s.bg.toUpperCase();
  $("statusText").textContent="Preview generated";
}
function scheduleRender(){clearTimeout(renderTimer);renderTimer=setTimeout(render,100);}
controls.forEach(id=>{
  $(id).addEventListener("input",scheduleRender);
  $(id).addEventListener("change",scheduleRender);
});
$("generateBtn").addEventListener("click",async()=>{
  $("statusText").textContent="Generating…";
  await render();
  $("statusText").textContent="Your design is ready";
});
$("downloadBtn").addEventListener("click",async()=>{
  await render();
  canvas.toBlob(blob=>{
    if(!blob){$("statusText").textContent="Could not export. Try again.";return;}
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="fontforge-stylish-text.png";
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    $("statusText").textContent="PNG downloaded";
  },"image/png");
});
$("resetBtn").addEventListener("click",()=>{
  $("textInput").value="SHADOW NAME";$("fontSelect").value="Creepster";
  $("textColor").value="#f7f3ff";$("bgColor").value="#11111b";
  $("backgroundMode").value="gradient";$("fontSize").value="96";
  $("letterSpacing").value="2";$("effectSelect").value="glow";$("uppercase").checked=true;
  render();
});
const importedFonts = new Map();
$("fontFileInput").addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  const status = $("fontImportStatus");
  if (!files.length) return;

  let loaded = 0;
  const failures = [];
  status.className = "font-import-status";
  status.textContent = "Loading selected font(s)…";

  for (const file of files) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["ttf", "otf", "woff", "woff2"].includes(ext)) {
      failures.push(`${file.name}: unsupported file type`);
      continue;
    }
    try {
      const family = `Imported_${file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}_${loaded}`;
      const fontFace = new FontFace(family, `url(${URL.createObjectURL(file)})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      importedFonts.set(family, { fileName: file.name, fontFace });
      const option = document.createElement("option");
      option.value = family;
      option.textContent = `${file.name.replace(/\.[^.]+$/, "")} — Imported`;
      option.dataset.imported = "true";
      $("fontSelect").appendChild(option);
      $("fontSelect").value = family;
      loaded++;
    } catch (error) {
      failures.push(`${file.name}: could not load this font`);
    }
  }

  if (loaded) {
    status.className = "font-import-status success";
    status.textContent = `${loaded} font${loaded > 1 ? "s" : ""} imported. Available in the font list for this session.`;
    await render();
  }
  if (failures.length) {
    status.className = loaded ? "font-import-status" : "font-import-status error";
    status.textContent = [status.textContent, ...failures].filter(Boolean).join(" • ");
  }
  event.target.value = "";
});
document.fonts.ready.then(render);
render();
