const imageInput = document.querySelector('#image-input');
const imagePreview = document.querySelector('#image-preview');
const describeButton = document.querySelector('#describe-button');
const result = document.querySelector('#result');

let currentPreviewUrl = null;
let selectedImageBase64 = null;

// Show a message before any image is chosen.
result.textContent = 'No image selected. Please choose an image first.';

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

  result.innerHTML =
    '<span class="result-icon" aria-hidden="true">✳</span><p>Your image is ready.</p>';
});

describeButton.addEventListener('click', async () => {
  if (!selectedImageBase64) {
    result.textContent = 'Please select an image first.';
    return;
  }

  describeButton.disabled = true;
  result.textContent = 'Describing image...';

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava',
        prompt: 'Describe this image in detail.',
        images: [selectedImageBase64],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    result.textContent = data.response;
  } catch (error) {
    console.error('Error connecting to Ollama:', error);
    result.textContent =
      'Something went wrong. Please make sure Ollama is running and try again.';
  } finally {
    describeButton.disabled = false;
  }
});