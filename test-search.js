// Test de la fonctionnalité de recherche
// Ce fichier peut être exécuté dans la console du navigateur pour tester la recherche

async function testSearch() {
  console.log("Testing search functionality...");
  
  // Récupérer le token d'accès
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("No access token found. Please log in first.");
    return;
  }
  
  console.log("Access token found:", token);
  
  // Tester la recherche
  try {
    const query = "test"; // Terme de recherche de test
    console.log(`Searching for: ${query}`);
    
    const response = await fetch(`http://localhost:3000/api/discovery/search?query=${encodeURIComponent(query)}&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const results = await response.json();
      console.log("Search results:", results);
      console.log(`Found ${results.length} results`);
    } else {
      console.error("Search failed with status:", response.status);
      const errorText = await response.text();
      console.error("Error details:", errorText);
    }
  } catch (error) {
    console.error("Error during search:", error);
  }
}

// Exécuter le test
testSearch();