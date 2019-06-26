import React from 'react'
import axios from 'axios'

function createObjectURL(file) {
  // The check for URL.revokeObjectURL fixes an issue with Opera 12,
  // which provides URL.createObjectURL but doesn't properly implement it:
  var urlAPI = (window.createObjectURL && window) ||
                (window.URL && URL.revokeObjectURL && window.URL) ||
                (window.webkitURL && window.webkitURL)
  return urlAPI ? urlAPI.createObjectURL(file) : false
}

let fileCount = 0;
export default function uploadFile(input,uploadUrl){
  let files = []
  if(!!window.FormData){
    for(var i = 0; i < input.files.length; i++){
      let file = input.files[i];
      file['index'] = fileCount++;
      setUploadMethods(input,file,uploadUrl);
      generatePreview(file);
      files.push(file);
    }
  }else{
    let file = {};
    file['name'] = input.value.substr(input.value.lastIndexOf('/')+1).substr(input.value.lastIndexOf('\\')+1);
    file['index'] = this.fileCount++;
    setUploadMethods(input,file,uploadUrl);
    generatePreview(file);
    files.push(file);
  }
  
  return files
}

function generatePreview(file){
  let type: string = file.type;
  if(!type){
    file['preview'] = <img alt={file.name} />;
  }else{
    let typeShort: string = type.split('/')[0];
    if(typeShort === 'image'){
      file['preview'] = <img alt={file.name} src={createObjectURL(file)} type={type} controls />;
    }
    else if(typeShort === 'video'){
      file['preview'] = <video src={createObjectURL(file)} type={type} controls />;
    }
    else if(typeShort === 'audio'){
      file['preview'] = <audio src={createObjectURL(file)} type={type} controls />;
    }
    else{
      file['preview'] = <object aria-label={file.name} data={createObjectURL(file)} type={type} />;
    }
  }
  
}

function setUploadMethods(input,file,uploadUrl){
  let ob;
  if(!!window.FormData){
    ob = uploadWithFormData.bind(this,input)
  }else{
    input.parentElement.appendChild(input.cloneNode());
    input.remove();
    ob = uploadWithoutFormData.bind(this,input)
  }
  
  file['submit'] = function(){
    return ob(file,uploadUrl).then((response)=>{
      return response.data;
    });
  }
}

function uploadWithFormData(input,file,uploadUrl){
  const formData = new FormData();
  formData.append(input.name,file,file.name);
  return axios.post(uploadUrl,formData,{
    headers: {'Content-Disposition': file.name},
    onUploadProgress: onUploadProgress.bind(this,file),
  })
}

function uploadWithoutFormData(input,fileObject, uploadUrl){
  let frameContainer = document.createElement('div');
  document.body.appendChild(frameContainer);
  
  let frameName = 'file_to_upload_iframe' + fileObject.index;
  
  let form = document.createElement('form');
  form.setAttribute('action',uploadUrl);
  form.setAttribute('target',frameName);
  form.setAttribute('method','POST');
  form.setAttribute('encType','multipart/form-data');
  form.appendChild(input);
  
  let frame = document.createElement('iframe');
  frame.setAttribute('name',frameName);
  frame.setAttribute('id',frameName);
  form.appendChild(frame);
  form.style['display'] = 'none';
  frameContainer.appendChild(form);
  
  return new Promise((resolve,reject) => {
    form.submit();
    frame.onload = function(){
        let response: string = (frame.contentDocument || frame.contentWindow.document).body.innerText;
        if(response){
          try{
            let result = JSON.parse(response);
            //simulate progress by return 100 % progress;
            onUploadProgress(fileObject,{loaded: 1, total: 1})
            frameContainer.remove();
            resolve({data: result});
          }catch(e){
            frameContainer.remove();
            fileObject.error = e;
            reject(e);
          }
        }
    }
  })
}

function onUploadProgress(file,event){
  if(file.onUploadProgress){
    file.onUploadProgress(file,event)
  }
}