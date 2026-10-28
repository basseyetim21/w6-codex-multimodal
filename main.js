const imageInput = document.querySelector('#image-input');
const imagePreview = document.querySelector('#image-preview');
const describeButton = document.querySelector('#describe-button');
const result = document.querySelector('#result');

let currentPreviewUrl = null;
let selectedImageBase64 = null;

imageInput.addEventListener('change', () => {
  const image = imageInput.files[0];

  if (!image) return;

  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const dataUrl = reader.result;
    selectedImageBase64 = dataUrl.split(',')[1];
    console.log(selectedImageBase64.slice(0, 50));
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
  fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llava',
      prompt: 'Describe this image in detail.',
      images: [selectedImageBase64],
      stream: false
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      result.innerHTML = `<span class="result-icon" aria-hidden="true">✳</span><p>${data.response}</p>`;
    })
    .catch(error => console.error('Error connecting to Ollama:', error));
});