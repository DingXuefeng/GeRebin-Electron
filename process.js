window.api.receive("fromMain", (msg) => {
  console.log(msg.message);
  console.log(msg.message.replace(/</g,"&lt").replace(/>/g,"&gt"));
  $("#output-log").append(`<li><span class="red">${msg.message.replace(/</g,"&lt").replace(/>/g,"&gt")}<span><span class="green">${msg.data.slice(200,205)}</span></li>`);
})
function process() {
  var lines = this.result.split('\n');
  var i = 0;
  for(;i<lines.length;++i) {
    if(lines[i]=='$DATA:') { i0 = i; break; }
  }
  console.log(`${i} ${lines[i]}`);
  var N = parseInt(lines[i+1].split(' ')[1]);
  console.log(N);
  var data = lines.slice(i+2,i+N+2+1).map(x => parseInt(x));
  for(i = i+N+2+1;i<lines.length;++i) {
    if(lines[i]=='$MCA_CAL:') { i1 = i; break; }
  }
  var mca = lines[i+2].split(' ').slice(0,3).map(x => parseFloat(x));
  window.api.send('toMain', {'name':this.name,'data':data,'mca':mca,'outConfig':this.outConfig}) //eg placed in your onclick
}

function startProcessing() {
  for (file of $('#inputFiles').prop('files')) {
    console.log(`processing <${file.name}>`);
    var fr = new FileReader();
    fr.name = file.name;
    fr.outConfig = { 
      'N':parseInt($('#N').val()),
      'dE':parseFloat($('#dE').val()),
    };
    fr.onload = process;
    fr.readAsText(file);
  }
}
$(function() { $("button#process").click(startProcessing); });
