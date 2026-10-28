const imageInput = document.querySelector('#image-input');
const imagePreview = document.querySelector('#image-preview');
const describeButton = document.querySelector('#describe-button');
const result = document.querySelector('#result');

let currentPreviewUrl = null;

imageInput.addEventListener('change', () => {
  const image = imageInput.files[0];

  if (!image) return;

  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const dataUrl = reader.result;
    const base64 = dataUrl.split(',')[1];
    console.log(base64.slice(0, 50));
  });
  reader.readAsDataURL(image);

  if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
  currentPreviewUrl = URL.createObjectURL(image);

  imagePreview.replaceChildren();
  const preview = document.createElement('img');
  preview.src = currentPreviewUrl;
  preview.alt = `Preview of ${image.name}`;
  imagePreview.append(preview);
  describeButton.disabled = false;

  result.innerHTML = '<span class="result-icon" aria-hidden="true">✳</span><p>Your image is ready. AI descriptions will be added next.</p>';
});

describeButton.addEventListener('click', () => {
  result.innerHTML = '<span class="result-icon" aria-hidden="true">✳</span><p>Image description is not connected yet. This is where the AI response will appear.</p>';
});
