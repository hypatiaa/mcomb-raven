// Render the two raven recipes literally as written (integer phases, exact grid; floats only for drawing).
const fs=require("fs");const out=process.argv[2];
const mod=(a,n)=>((a%n)+n)%n;
const step=(q,N2)=>[Math.cos(-2*Math.PI*q/N2),Math.sin(-2*Math.PI*q/N2)];
function path(ph,N2){let x=0,y=0;const p=[[0,0]];for(const q of ph){const s=step(q,N2);x+=s[0];y+=s[1];p.push([x,y]);}return p;}
function turning(ph,N2){let t=0;for(let i=1;i<ph.length;i++){let d=mod(ph[i]-ph[i-1],N2);if(d>N2/2)d-=N2;t+=d;}return t/N2;}

// Gauss pencil recipe, 2N=720, N=360
const P={N:360,N2:720};const half=[];
function stroke(a,b,c,L){const r=[];for(let j=0;j<L;j++)r.push(mod(a*j*j+b*j+c,P.N2));return r;}
const qEnd=(a,b,c,L)=>mod(a*L*L+b*L+c,P.N2);
let s1=stroke(-1,18,120,24);half.push(...s1);let c=qEnd(-1,18,120,24);
half.push(...stroke(1,-20,c,40));c=qEnd(1,-20,c,40);
for(let k=0;k<3;k++){const s=stroke(3,-42,c,28);half.push(...s);c=mod(qEnd(3,-42,c,28)+P.N,P.N2);} // +N reversal at each feather tip
half.push(...stroke(-1,24,c,48));c=qEnd(-1,24,c,48);
c=mod(c-90,P.N2);half.push(...stroke(2,-36,c,36));c=qEnd(2,-36,c,36);
c=mod(c+P.N,P.N2);half.push(...stroke(0,15,c,12));
const pencilAsWritten=half.concat(half.slice().reverse().map(q=>mod(P.N-q,P.N2)));
const pencilVertical=half.concat(half.slice().reverse().map(q=>mod(-q,P.N2)));

// Curlicue recipe, 2N=2520; q0=0, w0=0 (not given in the note); q and w carried across blocks
const C={N:1260,N2:2520};const blocks=[[14,45,null],[-8,40,20],[506,75,null],[717,126,null],[284,90,null]];
let q=0,w=0;const ch=[];
for(const [nu,L,jump] of blocks){for(let j=0;j<L;j++){if(jump!==null&&j===jump)q=mod(q+C.N,C.N2);ch.push(q);q=mod(q+w,C.N2);w=mod(w+nu,C.N2);}}
const curlAsWritten=ch.concat(ch.slice().reverse().map(x=>mod(C.N-x,C.N2)));

function svgPanel(pts,title,sub,ox,oy,W,H){const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const sc=Math.min((W-40)/(x1-x0||1),(H-110)/(y1-y0||1));
  const d=pts.map((p,i)=>`${i?"L":"M"}${(ox+20+(p[0]-x0)*sc).toFixed(1)},${(oy+90+(y1-p[1])*sc).toFixed(1)}`).join("");
  const e=pts[pts.length-1],g=Math.hypot(e[0],e[1]);
  return `<rect x="${ox}" y="${oy}" width="${W}" height="${H}" fill="#fff" stroke="#999"/><text x="${ox+12}" y="${oy+26}" font-size="20" font-family="sans-serif" font-weight="bold">${title}</text><text x="${ox+12}" y="${oy+50}" font-size="15" font-family="sans-serif">${sub}</text><text x="${ox+12}" y="${oy+70}" font-size="15" font-family="sans-serif">end gap |P_M| = ${g.toFixed(2)} (numerical readout)</text><path d="${d}" fill="none" stroke="#123" stroke-width="1.4"/><circle cx="${(ox+20+(0-x0)*sc).toFixed(1)}" cy="${(oy+90+(y1-0)*sc).toFixed(1)}" r="5" fill="#c33"/>`;}
const W=560,H=560;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${2*W}" height="${2*H+40}" viewBox="0 0 ${2*W} ${2*H+40}"><rect width="100%" height="100%" fill="#f4f4f4"/>
<text x="12" y="28" font-size="20" font-family="sans-serif">Raven recipes rendered under stated choices (audit v0.2, Opus 2026-10-14). Red dot = P_0. Exact integer phases.</text>
${svgPanel(path(pencilAsWritten,P.N2),"#408 Gauss pencil, as written",`2N=720, M=${pencilAsWritten.length}, mirror q→N−q, turning/half = ${turning(half,P.N2).toFixed(2)} turns`,0,40,W,H)}
${svgPanel(path(pencilVertical,P.N2),"#408 Gauss pencil, mirror q→−q",`vertical-axis mirror instead`,W,40,W,H)}
${svgPanel(path(half,P.N2),"#408 left half alone",`${half.length} steps`,0,40+H,W,H)}
${svgPanel(path(curlAsWritten,C.N2),"#409 curlicue, as written",`2N=2520, M=${curlAsWritten.length}, q0=w0=0 assumed`,W,40+H,W,H)}
</svg>`;
fs.writeFileSync(out,svg);
const tot=(a,b,L)=>(a*L*L+b*L);
console.log("pencil per-stroke net turn (turns):",[[-1,18,24],[1,-20,40],[3,-42,28],[-1,24,48],[2,-36,36],[0,15,12]].map(([a,b,L])=>(tot(a,b,L)/720).toFixed(2)).join(" "));
console.log("pencil half turning",turning(half,P.N2).toFixed(3),"M",pencilAsWritten.length);
for(const [nm,ph,N2] of [["pencil N-q",pencilAsWritten,720],["pencil -q",pencilVertical,720],["curl N-q",curlAsWritten,2520]]){const p=path(ph,N2);const e=p[p.length-1];console.log(nm,"end",e[0].toFixed(3),e[1].toFixed(3));}
