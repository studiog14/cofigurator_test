javascript:(function() {
  // Get the search toggle button
  const searchToggle = document.getElementById('search-toggle');
  
  if (searchToggle) {
    // Add position relative to the search toggle
    searchToggle.style.position = 'relative';
    
    // Create a new element for the line
    const line = document.createElement('div');
    
    // Style the line
    line.style.position = 'absolute';
    line.style.bottom = '-8px';
    line.style.left = '50%';
    line.style.transform = 'translateX(-50%)';
    line.style.width = '30px';
    line.style.height = '2px';
    line.style.backgroundColor = '#F5C842';
    line.style.borderRadius = '1px';
    
    // Append the line to the search toggle
    searchToggle.appendChild(line);
    
    console.log('Line added under search icon');
  } else {
    console.error('Search toggle button not found');
  }
})();