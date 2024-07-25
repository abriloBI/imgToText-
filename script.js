document.getElementById("convertButton").addEventListener("click", function () {
  const file = document.getElementById("imageUpload").files[0];
  const outputDiv = document.getElementById("output");

  if (!file) {
    outputDiv.innerText = "Please upload an image first.";
    outputDiv.style.color = "red";
    outputDiv.style.display = "block";
    return;
  }

  // Show loading bar for uploading
  showLoading(true, "Uploading");
  handleFileUpload(file);
});

const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    // Show loading bar for uploading
    showLoading(true, "Uploading");
    handleFileUpload(files[0]);
  }
});

function handleFileUpload(file) {
  const outputDiv = document.getElementById("output");
  const reader = new FileReader();

  reader.onprogress = function (event) {
    if (event.lengthComputable) {
      const percentLoaded = Math.round((event.loaded / event.total) * 100);
      updateLoadingProgress(percentLoaded);
    }
  };

  reader.onloadend = function () {
    // Hide loading bar and update button after upload
    updateLoadingProgress(100);
    document.getElementById("convertButton").innerText = "Submit and Extract";
    document
      .getElementById("convertButton")
      .removeEventListener("click", uploadHandler);
    document
      .getElementById("convertButton")
      .addEventListener("click", extractHandler);
    showLoading(false);
    handleFile(reader.result);
  };

  reader.readAsDataURL(file);
}

function handleFile(dataUrl) {
  const outputDiv = document.getElementById("output");
  const convertButton = document.getElementById("convertButton");

  // Show loading bar for extracting
  showLoading(true, "Extracting");
  updateLoadingProgress(0);
  convertButton.innerText = "Extracting";
  convertButton.disabled = true;

  Tesseract.recognize(dataUrl, "eng", {
    logger: (m) => {
      console.log(m);
      if (m.status === "recognizing text") {
        updateLoadingProgress(Math.round(m.progress * 100));
      }
    },
  })
    .then(({ data: { text } }) => {
      outputDiv.innerHTML = `<button id="copyButton" title="Copy to clipboard">Copy</button>${text}`;
      convertButton.innerText = "Start Over";
      convertButton.disabled = false;
      convertButton.removeEventListener("click", extractHandler);
      convertButton.addEventListener("click", () => location.reload());
      showLoading(false);
      hideUploading();
      outputDiv.style.display = "block";
      document
        .getElementById("copyButton")
        .addEventListener("click", copyToClipboard);
    })
    .catch((err) => {
      console.error(err);
      outputDiv.innerText = "Error processing image.";
      convertButton.innerText = "Start Over";
      convertButton.disabled = false;
      convertButton.removeEventListener("click", extractHandler);
      convertButton.addEventListener("click", () => location.reload());
      showLoading(false);
      hideUploading();
      outputDiv.style.display = "block";
    });
}

function showLoading(show, stage) {
  const loadingContainer = document.getElementById("loadingContainer");
  const loadingText = document.getElementById("loadingText");
  if (show) {
    loadingContainer.style.display = "block";
    loadingText.innerText = `${stage}: 0%`;
  } else {
    loadingContainer.style.display = "none";
  }
}

function updateLoadingProgress(percent) {
  const loadingProgress = document.getElementById("loadingProgress");
  const loadingText = document.getElementById("loadingText");
  loadingProgress.style.width = percent + "%";
  loadingText.innerText = `${percent}%`;
}

function uploadHandler() {
  const file = document.getElementById("imageUpload").files[0];
  if (!file) {
    document.getElementById("output").innerText =
      "Please upload an image first.";
    return;
  }
  handleFileUpload(file);
}

function extractHandler() {
  const file = document.getElementById("imageUpload").files[0];
  const outputDiv = document.getElementById("output");

  if (!file) {
    outputDiv.innerText = "Please upload an image first.";
    outputDiv.style.color = "red";
    return;
  }

  handleFile(file);
}

function hideUploading() {
  const uploading = document.getElementById("uploading");
  uploading.style.display = "none";
}

function copyToClipboard() {
  const outputText = document.getElementById("output").innerText;
  const textarea = document.createElement("textarea");
  textarea.value = outputText;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  alert("Text copied to clipboard!");
}
