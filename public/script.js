let cropper;

document.getElementById('uploadImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = document.getElementById('uploadedImage');
        img.src = event.target.result;

        cropper = new Cropper(img, {
            aspectRatio: 16 / 9,
            viewMode: 1,
            autoCrop: true,
            crop(event) {
                // Update cropping data
                document.getElementById('top').value = event.detail.y;
                document.getElementById('left').value = event.detail.x;
                document.getElementById('width').value = event.detail.width;
                document.getElementById('height').value = event.detail.height;
            }
        });
    };

    reader.readAsDataURL(file);
});

document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    formData.append('croppedData', JSON.stringify(cropper.getData()));
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        const thumbnailPreview = document.getElementById('thumbnailPreview');
        thumbnailPreview.src = imageUrl;
        thumbnailPreview.style.display = 'block';
    } else {
        alert('Error generating thumbnail.');
    }
});
