// Country Detection and Toggle Functionality
// Handles BD/ID country switching in footer

document.addEventListener('DOMContentLoaded', function() {
  // Get toggle elements
  const countryToggle = document.getElementById('countryToggle');
  const bdLabel = document.querySelector('.country-label-bd');
  const idLabel = document.querySelector('.country-label-id');
  
  if (!countryToggle) return;
  
  // Get stored preference or default to BD
  const storedCountry = localStorage.getItem('selectedCountry') || 'BD';
  
  // Initialize toggle state
  if (storedCountry === 'ID') {
    countryToggle.checked = true;
    if (bdLabel) bdLabel.classList.remove('active');
    if (idLabel) idLabel.classList.add('active');
  } else {
    countryToggle.checked = false;
    if (bdLabel) bdLabel.classList.add('active');
    if (idLabel) idLabel.classList.remove('active');
  }
  
  // Handle toggle change
  countryToggle.addEventListener('change', function() {
    const newCountry = this.checked ? 'ID' : 'BD';
    localStorage.setItem('selectedCountry', newCountry);
    
    if (this.checked) {
      if (bdLabel) bdLabel.classList.remove('active');
      if (idLabel) idLabel.classList.add('active');
    } else {
      if (bdLabel) bdLabel.classList.add('active');
      if (idLabel) idLabel.classList.remove('active');
    }
    
    // Trigger custom event for other scripts
    window.dispatchEvent(new CustomEvent('countryChanged', { detail: { country: newCountry } }));
  });
});

// Global function to switch country
function switchCountry(country) {
  const countryToggle = document.getElementById('countryToggle');
  const bdLabel = document.querySelector('.country-label-bd');
  const idLabel = document.querySelector('.country-label-id');
  
  if (!countryToggle) return;
  
  if (country === 'ID') {
    countryToggle.checked = true;
    if (bdLabel) bdLabel.classList.remove('active');
    if (idLabel) idLabel.classList.add('active');
  } else {
    countryToggle.checked = false;
    if (bdLabel) bdLabel.classList.add('active');
    if (idLabel) idLabel.classList.remove('active');
  }
  
  localStorage.setItem('selectedCountry', country);
  window.dispatchEvent(new CustomEvent('countryChanged', { detail: { country } }));
}
