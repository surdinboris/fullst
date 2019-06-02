$(document).ready(function() {
    console.log('loading started');
    //first step = loading fixed amount of images

    //second step = additionally loan fresh images by scrolling to bottom  trigger
    // https://picsum.photos/id/281/500/800


    // function loadimage(iurl) {
    //     return new Promise(function (res, rej) {
    //                 let downloadedimage = new Image();
    //                 downloadedimage.onload = function () {
    //                     let docimage = document.createElement("img");
    //                     docimage.setAttribute('id',iurl);
    //                     // docimage.setAttribute('id', counter);
    //                     docimage.src = this.src;
    //                     res(docimage)
    //                 };
    //                 downloadedimage.src = iurl;
    //         })
//
//     }
//     for(let i=0; i<100; i++){
//         (async function runit() {
//             let imgcont = document.getElementById('gallery');
//           let dwnlddimg= await  loadimage(`https://loremflickr.com/420/540`);
//           imgcont.appendChild(dwnlddimg)
//         })()
//
//     }
//
//
// });

    function loadimage(iurl) {
        return new Promise(function (res, rej) {
        fetch(iurl).then(response=>{

            let downloadedimage = new Image();
            downloadedimage.onload = function () {
                let docimage = document.createElement("img");
                // docimage.setAttribute('id',iurl);
                // docimage.setAttribute('id', counter);
                docimage.src = this.src;
                res(docimage)
            };
            downloadedimage.src = response.url;


        })
        })

    }
    for(let i=0; i<100; i++){
        (async function runit() {
            let imgcont = document.getElementById('gallery');
            let dwnlddimg= await  loadimage(`https://loremflickr.com/420/540`);
            imgcont.appendChild(dwnlddimg);
            console.log(dwnlddimg)
        })()

    }


});