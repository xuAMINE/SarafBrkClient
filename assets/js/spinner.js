// global.js (using ES6 modules)
export function showSpinner() {
  document.getElementById('loading-spinner').style.display = 'flex';
}

export function hideSpinner() {
  document.getElementById('loading-spinner').style.display = 'none';
}
