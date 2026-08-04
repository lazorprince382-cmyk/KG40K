"use strict";
const fs=require("fs"),path=require("path"),{spawnSync}=require("child_process");
const root=path.resolve(__dirname,"..");
const ignored=new Set(["node_modules","storage","backups","logs",".git"]),files=[];
function walk(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){if(ignored.has(entry.name))continue;const full=path.join(directory,entry.name);if(entry.isDirectory())walk(full);else if(entry.isFile()&&entry.name.endsWith(".js"))files.push(full);}}
walk(root);const failures=[];
for(const file of files){const result=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});if(result.status!==0)failures.push({file:path.relative(root,file),error:result.stderr||result.stdout});}
if(failures.length){for(const failure of failures)console.error(`\n${failure.file}\n${failure.error}`);process.exitCode=1;}else console.log(`Syntax verified: ${files.length} first-party JavaScript files.`);