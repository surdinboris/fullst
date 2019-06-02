$(document).ready(function() {
    console.log('loading started');
    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            alert("bottom!");
        }
    });

    function loadimage(iurl) {
        return new Promise(function (res, rej) {
            fetch(iurl).catch(e => rej(e)).then(response => response.blob())
                .then(imageblob => {
                    let urlimg = URL.createObjectURL(imageblob);
                    console.log(urlimg);
                        let docimage = document.createElement("img");
                        docimage.src = urlimg;
                    let imgcont = document.getElementById('gallery');
                    console.log(imgcont)
                        imgcont.appendChild(docimage);
                    res(docimage)
                })
        })
    }
            //
            // let downloadedimage = new Image();
            // downloadedimage.onload = function () {
            //     let docimage = document.createElement("img");
            //     docimage.src = this.src;
            //     res(docimage)

            // if(response){
            //     downloadedimage.src = response.url;
            // }
            // else {
            //     rej()
            // }
            // })
        // })

    // }
    for(let i=0; i<300; i++){
        (async function runit() {
            try {
                //let imgcont = document.getElementById('gallery');
                await  loadimage(`https://loremflickr.com/220/340`);
                //imgcont.appendChild(dwnlddimg);
            } catch (e) {
                console.log(e)
            }

        })()

    }


});