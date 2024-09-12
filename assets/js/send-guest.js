// Restrict input to digits only and limit length
document.addEventListener('DOMContentLoaded', function () {
  function restrictInput(inputId, maxLength) {
    const inputElement = document.getElementById(inputId);

      inputElement.addEventListener('input', function(e) {
        // Remove non-numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');
  
        // Limit to the specified number of digits
        if (this.value.length > maxLength) {
          this.value = this.value.slice(0, maxLength);
        }
      });
    }
  
    // Apply the restriction to specific input fields
    restrictInput('cle', 2);
    restrictInput('ccp', 12);
  });