const imageInput = document.querySelector('#image-input');
const imagePreview = document.querySelector('#image-preview');
const imageInput2 = document.querySelector('#image-input-2');
const imagePreview2 = document.querySelector('#image-preview-2');
const describeButton = document.querySelector('#describe-button');
const result = document.querySelector('#result');

let previewUrl1 = null;
let previewUrl2 = null;
let selectedImageBase64 = null;
let selectedImageBase64_2 = null;

// Show a message before any image is chosen.
result.textContent = 'No image selected. Please choose an image first.';

// Show a preview of a file inside a preview box. Returns the new temporary URL.
function showPreview(file, previewBox, oldUrl) {
  if (oldUrl) URL.revokeObjectURL(oldUrl);
  const url = URL.createObjectURL(file);

  previewBox.replaceChildren();
  const img = document.createElement('img');
  img.src = url;
  img.alt = `Preview of ${file.name}`;
  previewBox.append(img);

  return url;
}

// Read a file and give back its base64 text (without the data:image prefix).
function readAsBase64(file, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    callback(reader.result.split(',')[1]);
  });
  reader.readAsDataURL(file);
}

imageInput.addEventListener('change', () => {
  const image = imageInput.files[0];
  if (!image) return;

  readAsBase64(image, (base64) => {
    selectedImageBase64 = base64;
    console.log('Image 1:', base64.slice(0, 50));
  });

  previewUrl1 = showPreview(image, imagePreview, previewUrl1);
  describeButton.disabled = false;

  result.innerHTML =
    '<span class="result-icon" aria-hidden="true">✳</span><p>Your image is ready.</p>';
});

imageInput2.addEventListener('change', () => {
  const image = imageInput2.files[0];
  if (!image) return;

  readAsBase64(image, (base64) => {
    selectedImageBase64_2 = base64;
    console.log('Image 2:', base64.slice(0, 50));
  });

  previewUrl2 = showPreview(image, imagePreview2, previewUrl2);
});

describeButton.addEventListener('click', async () => {
  if (!selectedImageBase64 || !selectedImageBase64_2) {
    result.textContent = 'Please select both images first.';
    return;
  }

  describeButton.disabled = true;

  const loading = document.createElement('div');
  loading.className = 'loading-indicator';

  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const message = document.createElement('p');
  message.textContent = 'Describing images...';

  loading.append(spinner, message);
  result.replaceChildren(loading);

  async function describeImage(imageBase64) {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava',
        prompt: 'Describe this image in detail.',
        images: [imageBase64],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    return response.json();
  }

  try {
    const [image1Response, image2Response] = await Promise.all([
      describeImage(selectedImageBase64),
      describeImage(selectedImageBase64_2)
    ]);

    console.log('Image 1', image1Response);
    console.log('Image 2', image2Response);
  } catch (error) {
    console.error('Error connecting to Ollama:', error);
    result.textContent =
      'Something went wrong. Please make sure Ollama is running and try again.';
  } finally {
    describeButton.disabled = false;
  }
});