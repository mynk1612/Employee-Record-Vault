let currentStep = 1;

// Step Navigation Function
function goToStep(targetStep) {
  // Validate Step 1 before proceeding to Step 2
  if (targetStep === 2 && currentStep === 1) {
    const requiredFields = ['fullName', 'dob', 'contact', 'email', 'education', 'course'];
    for (let id of requiredFields) {
      const field = document.getElementById(id);
      if (!field.value.trim()) {
        alert('Please fill out all required personal and education details.');
        field.focus();
        return;
      }
    }
  }

  // Validate Step 2 before proceeding to Step 3
  if (targetStep === 3 && currentStep === 2) {
    const resume = document.getElementById('resumeFile');
    if (!resume.files || resume.files.length === 0) {
      alert('Please upload your Resume before moving ahead.');
      return;
    }
  }

  // Toggle active sections
  document.querySelectorAll('.step-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.step-item').forEach(item => item.classList.remove('active'));

  document.getElementById(`step${targetStep}`).classList.add('active');
  document.querySelector(`.step-item[data-step="${targetStep}"]`).classList.add('active');

  currentStep = targetStep;
}

// Click triggers for custom file upload containers
document.getElementById('resumeBox').addEventListener('click', () => {
  document.getElementById('resumeFile').click();
});

document.getElementById('photoBox').addEventListener('click', () => {
  document.getElementById('photoFile').click();
});

// Display chosen Resume file name
document.getElementById('resumeFile').addEventListener('change', function () {
  if (this.files && this.files[0]) {
    document.getElementById('resumeFileName').textContent = "Selected: " + this.files[0].name;
  }
});

// Image preview for Photo upload
document.getElementById('photoFile').addEventListener('change', function () {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById('photoPreview');
      img.src = e.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(this.files[0]);
  }
});

// Step Button Listeners
document.getElementById('nextToStep2').addEventListener('click', () => goToStep(2));
document.getElementById('backToStep1').addEventListener('click', () => goToStep(1));
document.getElementById('nextToStep3').addEventListener('click', () => goToStep(3));
document.getElementById('backToStep2').addEventListener('click', () => goToStep(2));

// Handle Final Form Submission & Send to Backend
document.getElementById('employeeForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const photoInput = document.getElementById('photoFile');
  const resumeInput = document.getElementById('resumeFile');

  if (!photoInput.files || photoInput.files.length === 0) {
    alert('Please upload your photograph before submitting.');
    return;
  }

  // Prepare form data including binary files
  const formData = new FormData();
  formData.append('fullName', document.getElementById('fullName').value);
  formData.append('dob', document.getElementById('dob').value);
  formData.append('contact', document.getElementById('contact').value);
  formData.append('email', document.getElementById('email').value);
  formData.append('education', document.getElementById('education').value);
  formData.append('course', document.getElementById('course').value);
  
  // Files append ho rahi hain
  formData.append('resume', resumeInput.files[0]);
  formData.append('photo', photoInput.files[0]);

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving to Excel...';

  try {
    const response = await fetch('/api/submit-employee', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      // Hide form & show success UI
      document.getElementById('employeeForm').style.display = 'none';
      document.getElementById('stepper').style.display = 'none';
      document.getElementById('successBox').style.display = 'block';
    } else {
      alert('Error saving data: ' + result.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Form';
    }
  } catch (error) {
    console.error('Submission failed:', error);
    alert('Server connect nahi ho paya. Ensure karein terminal mein "node server.js" run ho raha hai.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Form';
  }
});