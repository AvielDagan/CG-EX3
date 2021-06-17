function drawF() {
    var slice;
    var file = document.getElementById('input-file').files;

    if (!file.length) {
        alert("Please select a file");
        return;
    }

    file = file[0];
    var fileReader = new FileReader();

    fileReader.onloadend = function (event) {
        if (event.target.readyState == FileReader.DONE) {
            var fileContent = fileReader.result;

            if (!fileContent.length) {
                alert("File is empty"); return;
            }

            console.log('fileContent:', fileContent)
        }
    }
    if(file.slice){slice=file.slice(0,file.size);}
	else if(file.webkitSlice){slice=file.webkitSlice(0,file.size);}
	else if(file.mozSlice){slice=file.mozSlice(0,file.size);}
	fileReader.readAsText(slice);
}