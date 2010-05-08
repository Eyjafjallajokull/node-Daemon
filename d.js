var sys = require('sys'),
  fs = require('fs'),
  spawn = require('child_process').spawn,
  path = require('path');


function Daemon (args) {
  this.whatchedFiles = [];
  this._depQuene = [];
  this._process = null;
  
  // parse args
  this.childName = args[2];
  if (!args[2]) {
    sys.puts("Usage: node d.js server.js [params]");
    process.exit(1);
  }
  args.splice(0,2);
  this.childParams = args;
  
  this.collectDeps(this.childName);
}
Daemon.prototype.collectDeps = function (file) {
  this._depQuene.push(file);
  this.whatchedFiles.push(file);
  this._collectDeps();  
}

Daemon.prototype._collectDeps = function () {
  var file = this._depQuene.pop();
  
  var d = this;
  fs.readFile( file, function(err, data) { 
    var deps = {};
    var dir = path.dirname(file);
    
    while(match = /(?:^|[^\w-])require *\(\s*['"](\.\/|\.\.|\/)(.*?)['"]\s*\)/g.exec(data)) {
      var t = path.join(match[1] == '/'? '' : dir , (match[1] != "./"? match[1] : '') + match[2] + '.js');
      if (d.whatchedFiles.indexOf(t)==-1)
        deps[t] = true;
    }
    deps = Object.keys(deps);        
    deps.forEach(function(dep) {
      d._depQuene.push(dep);
      d.whatchedFiles.push(dep);
    });
    
    if (d._depQuene.length==0)
      d.startWatching();
    else
      d._collectDeps();
  });
}
Daemon.prototype.startWatching = function(argv) {
  var d = this;
  this.whatchedFiles.forEach(function(file) {
    fs.watchFile(file, function(curr, prev) {
      d.restartChild();
    });
  });
  this.startChild();
}
Daemon.prototype.startChild = function() {  
  this._process = spawn('node',this.childParams);
  this._process.stdout.addListener('data', function(data) {
    sys.print(data);
  });
  this._process.stderr.addListener('data', function(data) {
    sys.print(data);
  });
  var d = this;
  //this._process.addListener('exit', function() {});
}
Daemon.prototype.killChild = function() {
  if (this._process && this._process.pid) this._process.kill();
}
Daemon.prototype.restartChild = function() {
  sys.puts("\033[31mRestarting child process.\033[m");
  this.killChild();
  this.startChild();
}

sys.puts("Press [enter] anytime to restart child process.");
sys.puts("Press Ctrl+C to exit node-Daemon.");
var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.addListener('data', function (chunk) {
  if (chunk[chunk.length-1]=="\n")
    d.restartChild();
});

var d = new Daemon(process.argv);


