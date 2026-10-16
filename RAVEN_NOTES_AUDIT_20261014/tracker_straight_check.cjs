// Check of the relayed critique of #413's greedy tracker: a straight segment halfway between
// allowed headings. Also tests one repair: target spacing cos(pi/2N) instead of 1.
const TAU=2*Math.PI;
function track(gamma,N2){let P=[0,0],maxd=0;for(let j=0;j+1<gamma.length;j++){let best=1e9,bp=null;
  for(let k=0;k<N2;k++){const a=-TAU*k/N2,Q=[P[0]+Math.cos(a),P[1]+Math.sin(a)],d=Math.hypot(Q[0]-gamma[j+1][0],Q[1]-gamma[j+1][1]);if(d<best){best=d;bp=Q;}}
  P=bp;maxd=Math.max(maxd,best);}return maxd;}
for(const N2 of [24,72,720]){const th=Math.PI/N2; // halfway between headings 0 and 2pi/N2
  for(const M of [250,1000,4000]){
    const line=sp=>Array.from({length:M+1},(_,j)=>[j*sp*Math.cos(th),-j*sp*Math.sin(th)]);
    const pred=M*(1-Math.cos(th));
    console.log(`2N=${N2} M=${M}: max error spacing 1 = ${track(line(1),N2).toFixed(3)} (predicted lag M(1-cos(pi/2N)) = ${pred.toFixed(3)}); spacing cos(pi/2N) = ${track(line(Math.cos(th)),N2).toFixed(3)}`);}}
