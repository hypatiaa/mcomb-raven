// Audit checks for Gemini's raven notes (#408/#409). Floats only for readouts; integer phases exact.
const TAU=2*Math.PI;
const e=(x)=>[Math.cos(TAU*x),Math.sin(TAU*x)]; // e(x)=exp(2 pi i x)
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const f=(z)=>`${z[0].toFixed(6)} ${z[1]>=0?"+":"-"} ${Math.abs(z[1]).toFixed(6)}i`;
const mod=(a,n)=>((a%n)+n)%n;

console.log("== C1: normalized pure Gauss sum s*(a,q)=(1/q) sum e(-a r^2/q)");
for(const q of [5,7,9,11,23,71]) for(const a of [1,2]){ if(q%a===0&&a>1)continue;
  let z=[0,0];for(let r=0;r<q;r++)z=add(z,e(-a*r*r/q));
  console.log(`q=${q} a=${a}: s*=${f([z[0]/q,z[1]/q])}  |s*|*sqrt(q)=${(Math.hypot(...z)/Math.sqrt(q)).toFixed(6)}  q mod 4=${q%4}`);}

console.log("\n== C2: actual block sums of the recurrence q(j+1)=q(j)+w, w(j+1)=w+nu (mod 2N), step zeta_{2N}^{q}=e(-q/2N)");
function walk(N2,q0,w0,nu,L){let q=q0,w=w0,P=[0,0],pts=[[0,0]],ph=[];for(let j=0;j<L;j++){ph.push(q);P=add(P,e(-q/N2));pts.push(P);q=mod(q+w,N2);w=mod(w+nu,N2);}return {pts,ph,qEnd:q,wEnd:w};}
const N2=2520;
for(const [name,nu,qq] of [["block3 covert 1/5",506,5],["block4 primary 2/7",717,7],["block5 tail 1/9",284,9]]){
  for(const w0 of [0,100,1000]){
    const {pts}=walk(N2,0,w0,nu,qq*6);
    const blocks=[];for(let m=0;m<6;m++){const a=pts[m*qq],b=pts[(m+1)*qq];blocks.push([b[0]-a[0],b[1]-a[1]]);}
    console.log(`${name} w0=${w0}: |block|/sqrt(q) = ${blocks.map(z=>(Math.hypot(...z)/Math.sqrt(qq)).toFixed(3)).join(" ")} ; block0 = ${f(blocks[0])}`);
  }
}

console.log("\n== C3: mirror pairing q(M-1-j) = N - q(j) (as written) vs q(M-1-j) = -q(j)");
function closeTest(rule){ // random left half
  const N=360,N2=720,H=50; let s=7;const rnd=()=>{s=(s*1103515245+12345)%2147483648;return s;};
  const left=[];let q=rnd()%N2;for(let j=0;j<H;j++){left.push(q);q=mod(q+(rnd()%21)-10,N2);}
  const all=left.slice();for(let j=H-1;j>=0;j--)all.push(rule==="N-q"?mod(N-left[j],N2):mod(-left[j],N2));
  let P=[0,0];for(const k of all)P=add(P,e(-k/N2));let Ph=[0,0];for(const k of left)Ph=add(Ph,e(-k/N2));
  return `total=${f(P)}  half-end P_{M/2}=${f(Ph)}`;}
console.log("N-q :",closeTest("N-q"));
console.log("-q  :",closeTest("-q"));

console.log("\n== C4: Gauss-pencil recipe stroke lengths");
console.log("sum L =",24+40+84+48+36+12,"(note says M/2 = 244)");

console.log("\n== C5: Hopf map of a fixed product torus: w=z1/z2 has |w|=a/b fixed, arg = th1-th2");
const rho=1,a=rho/Math.sqrt(1+rho*rho),b=1/Math.sqrt(1+rho*rho);
for(const [t1,t2] of [[0,0],[0.3,0.3],[0.1,0.6],[0.7,0.2]]){const w=[a/b*Math.cos(TAU*(t1-t2)),a/b*Math.sin(TAU*(t1-t2))];const m2=w[0]**2+w[1]**2;
  console.log(`th1=${t1} th2=${t2}: S2 point = ${[2*w[0]/(1+m2),2*w[1]/(1+m2),(m2-1)/(1+m2)].map(x=>x.toFixed(4)).join(", ")}`);}

console.log("\n== C6: Clifford portrait of a quadratic stroke: th1 increments equal th2 (shear), slope not constant");
{const {ph}=walk(720,120,17,-2,8);const d=ph.slice(1).map((x,i)=>mod(x-ph[i],720));console.log("q(j):",ph.join(" "),"\nDelta q:",d.join(" "));}
