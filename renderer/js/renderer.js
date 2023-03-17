const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");


function loadImage(e){
    const file = e.target.files[0];
    if(!isFileImage(file)){
        alertError("pleas upload an image file");
        console.log("pleas upload an image file");
        return;
    }
    //getOriginalDimenstions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function(){
        widthInput.value = this.width;
        heightInput.value = this.height;
    }
    form.style.display = "block";
    filename.innerHTML = file.name
    outputPath.innerHTML = path.join(os.homedir(), "imageresizer")
    alertSuccess("Image successfully uploaded");
}
img.addEventListener("change", loadImage);

//Check if file is image or not
const acceptedImageTypes = ["image/gif", "image/png", "image/jpeg"];
function isFileImage(file){

    return file && acceptedImageTypes.includes(file["type"]);
}

//Catch the image:done event
ipcRenderer.on("image:done", ()=>{alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value}`)})

function sendImage(e){
    
    e.preventDefault();
    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;

    if(!img.files[0]){
        alertError("Please upload an image");
        return;
    }
    if(width==="" || height === ""){
        alertError("Please fill in a height and width");
    }
    //Send to main using ipcRenderer
    ipcRenderer.send("image:resize", {imgPath, width, height});
}

form.addEventListener("submit", sendImage);




//alert for error
function alertError(message){
    Toastify.toast({
        text:message,
        duration:5000,
        close:false,
        style:{ background:"red",
                color:"white",
                textAlign:"center"
            }
    });
}

function alertSuccess(message){
    Toastify.toast({
        text:message,
        duration:5000,
        close:false,
        style:{ background:"green",
                color:"white",
                textAlign:"center"
            }
    });
}