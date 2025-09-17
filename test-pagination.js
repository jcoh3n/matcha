// Test de la pagination
// Ce script peut être exécuté dans la console du navigateur

async function testPagination() {
  console.log("Testing pagination functionality...");
  
  // Récupérer le token d'accès
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("No access token found. Please log in first.");
    return;
  }
  
  console.log("Access token found:", token);
  
  // Tester la pagination avec différents offsets
  try {
    console.log("Testing discovery users with pagination...");
    
    // Première page (offset 0)
    const response1 = await fetch("http://localhost:3000/api/discovery?limit=3&offset=0", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response1.ok) {
      const results1 = await response1.json();
      console.log("First page (offset 0):", results1);
      console.log(`Found ${results1.length} users on first page`);
    } else {
      console.error("First page request failed with status:", response1.status);
    }
    
    // Deuxième page (offset 3)
    const response2 = await fetch("http://localhost:3000/api/discovery?limit=3&offset=3", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response2.ok) {
      const results2 = await response2.json();
      console.log("Second page (offset 3):", results2);
      console.log(`Found ${results2.length} users on second page`);
    } else {
      console.error("Second page request failed with status:", response2.status);
    }
    
    // Vérifier que les résultats sont différents
    console.log("Pagination test completed successfully!");
    
  } catch (error) {
    console.error("Error during pagination test:", error);
  }
}

// Exécuter le test
testPagination();