"use strict";
(function(){
  const input=document.querySelector('#csvInput');
  const output=document.querySelector('#jsonOutput');
  const status=document.querySelector('#status');
  if(!input||!output||!status)return;
  function csvRows(source){
    let rows=[],row=[],cell='',inside=false,i=0;
    for(;i<source.length;i++){
      const c=source[i];
      if(inside){
        if(c==='"'&&source[i+1]==='"'){cell+='"';i++;}
        else if(c==='"'){inside=false;}
        else cell+=c;
      }else if(c==='"'){
        if(cell.length!==0)throw Error('Unexpected quote inside a field');
        inside=true;
      }else if(c===','){row.push(cell);cell='';}
      else if(c==='\r'||c==='\n'){
        if(c==='\r'&&source[i+1]==='\n')i++;
        row.push(cell);rows.push(row);row=[];cell='';
      }else cell+=c;
    }
    if(inside)throw Error('Unclosed quoted field');
    if(row.length||cell.length){row.push(cell);rows.push(row);}
    return rows;
  }
  function convert(text){
    if(text.charCodeAt(0)===0xfeff)text=text.slice(1);
    const rows=csvRows(text);
    if(!rows.length)throw Error('Please enter some CSV data');
    const headers=rows.shift();
    if(headers.some(x=>!x.trim())||new Set(headers).size!==headers.length)throw Error('Column names must be unique and non-empty');
    return rows.filter(row=>!(row.length===1&&row[0]==='')).map((row,i)=>{
      if(row.length!==headers.length)throw Error('Data row '+(i+2)+' has a different number of columns');
      return Object.fromEntries(headers.map((key,j)=>[key,row[j]]));
    });
  }
  document.querySelector('#convert').addEventListener('click',()=>{
    try{
      const records=convert(input.value);
      output.value=JSON.stringify(records,null,2);
      status.textContent='Converted '+records.length+' row(s) in this browser.';
      status.style.color='#8decda';
    }catch(err){output.value='';status.textContent=err.message;status.style.color='#ffb6a8';}
  });
  document.querySelector('#reset').addEventListener('click',()=>{
    input.value='name,score\nAlex,12\nTaylor,18';output.value='';status.textContent='Sample loaded.';
  });
  document.querySelector('#copy').addEventListener('click',async()=>{
    if(!output.value){status.textContent='Convert data first.';return;}
    try{await navigator.clipboard.writeText(output.value);status.textContent='JSON copied.';}
    catch(err){output.select();status.textContent='Select and copy the JSON manually.';}
  });
})();
