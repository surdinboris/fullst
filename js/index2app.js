$(document).ready(function() {
    console.log('loading started');
    $(window).scroll(function() {
        if($(window).scrollTop() == $(document).height() - $(window).height()) {
            console.log('load additional images')
            loadimage(`https://picsum.photos/200/300`,20)
        }
    });
    let counter=0;
    function loadimage(iurl,amount) {
        counter++;
        return new Promise(function (res, rej) {
            fetch(iurl).catch(e => rej(e)).then(response => response.blob())
                .then(imageblob => {
                    let urlimg = URL.createObjectURL(imageblob);
                    console.log(urlimg);
                        let docimage = document.createElement("img");
                        docimage.src = urlimg;
                    let imgcont = document.getElementById('gallery');
                    console.log(imgcont);
                    imgcont.appendChild(docimage);
                    //download(imageblob, `img${counter}.jpg`);
                    if(counter < amount){
                        setTimeout(function () {
                            loadimage(iurl, amount)
                        },0)

                    }


                })
        })
    }
    loadimage(`https://picsum.photos/300/500`,8)


    function download(data, filename) {
        var file = new Blob([data]);
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

});