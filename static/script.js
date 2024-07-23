// const video = document.getElementById('video');
// const canvas = document.getElementById('canvas');
// const startCameraButton = document.getElementById('start-camera');
// const captureButton = document.getElementById('capture');

// startCameraButton.addEventListener('click', async () => {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = stream;
//     } catch (error) {
//         console.error('Error accessing camera:', error);
//     }
// });

// captureButton.addEventListener('click', () => {
//     const context = canvas.getContext('2d');
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     // Converting the canvas to a data URL
//     const dataURL = canvas.toDataURL('image/png');

//     // Sending the image data to the server
//     fetch('/process', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ image: dataURL }),
//     })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Success:', data);
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//         });
// });
