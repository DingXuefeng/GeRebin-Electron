function resample(data,mca,outConfig) {
  if(!Array.isArray(data) || !Array.isArray(mca) || mca.length!=3) return undefined;
  for(let i=1;i<data.length;++i) {
    data[i] = data[i-1]+data[i];
  }
  var N = data.slice(-1)[0];
  let out = Array(outConfig.N /* N bins */).fill(0);
  for(let i = 0;i<N;++i) {
    let x = Math.random()*N;
    let j = 1;
    while(data[j]<x && j<N) ++j;
    let y = j+(x-data[j-1])/(data[j]-data[j-1]);
    let z = mca[0]+mca[1]*y+mca[2]*y*y; // in keV
    ++out[Math.floor(z/outConfig.dE /* in keV */)];
  }
  return out;
}

//export { resample };
module.exports.resample = resample;
