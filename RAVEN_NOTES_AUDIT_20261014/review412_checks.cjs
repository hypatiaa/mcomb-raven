// Checks of #412 R1/R2 and #413's greedy 2D tracker (floats for readouts only).
const TAU=2*Math.PI,e=x=>[Math.cos(TAU*x),Math.sin(TAU*x)],add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const f=z=>`${z[0].toFixed(6)} ${z[1]>=0?"+":"-"} ${Math.abs(z[1]).toFixed(6)}i`;
// R1
const c=0,q=(j)=>3*j*j-42*j+c;console.log("R1: q(27)=",q(27),"q(28)+360=",q(28)+360,"dq mod 720 =",((q(28)+360-q(27))%720+720)%720);
// R2: block sum at u=0, omega0=0: sum_r e(-(a r(r-1)/2)/q), q=7 a=2
let z=[0,0];for(let r=0;r<7;r++)z=add(z,e(-(2*r*(r-1)/2)/7));
const claim=(()=>{const w=e(2/7),s=Math.sqrt(7);return [w[0]*0-w[1]*(-s),w[0]*(-s)+w[1]*0];})();
console.log("R2: block =",f(z)," claim e(2/7)(-i sqrt7) =",f(claim));
// #413 greedy tracker: q(j)=argmin |P_j+zeta^q - gamma(j+1)|, gamma at unit arc length
function track(gamma,N2){let P=[gamma[0][0],gamma[0][1]],maxd=0;for(let j=0;j+1<gamma.length;j++){let best=1e9,bp=null;for(let k=0;k<N2;k++){const s=e(-k/N2),Q=[P[0]+s[0],P[1]+s[1]],d=Math.hypot(Q[0]-gamma[j+1][0],Q[1]-gamma[j+1][1]);if(d<best){best=d;bp=Q;}}P=bp;maxd=Math.max(maxd,best);}const g=gamma[gamma.length-1];return {maxd,end:Math.hypot(P[0]-g[0],P[1]-g[1])};}
function resample(fn,T,n){ // dense polyline -> unit arc length points
  const pts=[];for(let i=0;i<=n;i++)pts.push(fn(T*i/n));const out=[pts[0]];let acc=0,prev=pts[0];
  for(let i=1;i<pts.length;i++){let a=prev,b=pts[i],seg=Math.hypot(b[0]-a[0],b[1]-a[1]);while(acc+seg>=1){const t=(1-acc)/seg;const p=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])];out.push(p);a=p;seg=Math.hypot(b[0]-a[0],b[1]-a[1]);acc=0;}acc+=seg;prev=b;}return out;}
for(const [name,fn] of [["circle r=40",t=>[40*Math.cos(t),40*Math.sin(t)]],["ellipse 60x15",t=>[60*Math.cos(t),15*Math.sin(t)]],["star-ish r=40(1+.3cos5t)",t=>{const r=40*(1+0.3*Math.cos(5*t));return [r*Math.cos(t),r*Math.sin(t)];}]])
  for(const N2 of [24,72,720]){const g=resample(fn,TAU,200000);const r=track(g,N2);console.log(`tracker ${name} 2N=${N2} M=${g.length-1}: max dist to target ${r.maxd.toFixed(3)}, end gap to gamma(M) ${r.end.toFixed(3)}`);}
