// Test script to debug kubełek leg filtering
function testLegFiltering() {
  // Sample data from CSV
  const testData = [
    // Legs
    { Kategoria: 'krzesła', Nazwa: 'Slim', Grupa: 'nogi', Typ: 'metal', DlaKubełka: 'Soul, Soul Plus' },
    { Kategoria: 'krzesła', Nazwa: 'Okrągłe', Grupa: 'nogi', Typ: 'metal, drewno', DlaKubełka: 'Soul, Soul Plus' },
    { Kategoria: 'krzesła', Nazwa: 'Obrotowe', Grupa: 'nogi', Typ: 'metal', DlaKubełka: 'Soul, Soul Plus' },
    { Kategoria: 'hookery', Nazwa: 'Hooker 75cm', Grupa: 'nogi', Typ: '', DlaKubełka: 'Soul (hooker), Soul Plus (hooker)' },
    { Kategoria: 'hookery', Nazwa: 'Hooker 65cm', Grupa: 'nogi', Typ: '', DlaKubełka: 'Soul (hooker), Soul Plus (hooker)' },
    
    // Chairs
    { Kategoria: 'hookery', Nazwa: 'Soul (hooker)', Grupa: 'kubełek', Typ: 'model' },
    { Kategoria: 'hookery', Nazwa: 'Soul Plus (hooker)', Grupa: 'kubełek', Typ: 'model' },
    { Kategoria: 'krzesła', Nazwa: 'Soul', Grupa: 'kubełek', Typ: 'model' },
    { Kategoria: 'krzesła', Nazwa: 'Soul Plus', Grupa: 'kubełek', Typ: 'model' }
  ];

  function stripBrackets(name) {
    if (!name) return name;
    return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  }

  function czyNogaPasujeDoKubełka(nogaVariant, kubelekNazwa) {
    const zgodneKubełki = (nogaVariant.DlaKubełka || '')
      .toLowerCase()
      .split(',')
      .map(k => stripBrackets(k.trim()).toLowerCase());
    const kubelekNorm = stripBrackets(kubelekNazwa || '').toLowerCase();
    
    return zgodneKubełki.includes(kubelekNorm);
  }

  function filterLegsForChair(selectedChair) {
    return testData.filter(d => {
      if (d.Grupa.toLowerCase() !== 'nogi') return false;
      
      // Category filtering
      const nogaKategoria = (d.Kategoria || d.Typ || d.Grupa || '').toLowerCase();
      const chairKategoria = (selectedChair?.Kategoria || '').toLowerCase();
      
      // If hookery chair, show only hooker legs
      if (chairKategoria.includes('hooker')) {
        if (!nogaKategoria.includes('hooker')) return false;
      }
      // If krzesła chair, show only krzesła legs (and universal)
      else if (chairKategoria.includes('krzes')) {
        if (nogaKategoria.includes('hooker')) return false;
        if (!(nogaKategoria.includes('krzes') || nogaKategoria === '' || nogaKategoria === 'nogi')) return false;
      }
      
      // Kubełek compatibility check
      if (!selectedChair || selectedChair.Grupa.toLowerCase() !== 'kubełek') return true;
      return czyNogaPasujeDoKubełka(d, selectedChair.Nazwa);
    });
  }

  // Test scenarios
  const testChairs = [
    testData.find(d => d.Nazwa === 'Soul (hooker)'),
    testData.find(d => d.Nazwa === 'Soul Plus (hooker)'),
    testData.find(d => d.Nazwa === 'Soul'),
    testData.find(d => d.Nazwa === 'Soul Plus')
  ];

  console.log('=== TESTING KUBEŁEK LEG FILTERING ===');
  
  testChairs.forEach(chair => {
    console.log(`\n🪑 Testing chair: ${chair.Nazwa} (${chair.Kategoria})`);
    const legs = filterLegsForChair(chair);
    console.log(`   Available legs: ${legs.map(l => l.Nazwa).join(', ')}`);
    
    // Show detailed matching
    testData.filter(d => d.Grupa.toLowerCase() === 'nogi').forEach(leg => {
      const categoryOk = (() => {
        const nogaKategoria = (leg.Kategoria || leg.Typ || leg.Grupa || '').toLowerCase();
        const chairKategoria = (chair?.Kategoria || '').toLowerCase();
        
        if (chairKategoria.includes('hooker')) {
          return nogaKategoria.includes('hooker');
        } else if (chairKategoria.includes('krzes')) {
          return !nogaKategoria.includes('hooker') && (nogaKategoria.includes('krzes') || nogaKategoria === '' || nogaKategoria === 'nogi');
        }
        return true;
      })();
      
      const kubełekOk = czyNogaPasujeDoKubełka(leg, chair.Nazwa);
      
      console.log(`   - ${leg.Nazwa}: category=${categoryOk}, kubełek=${kubełekOk}, overall=${categoryOk && kubełekOk}`);
    });
  });
}

// Run the test
testLegFiltering();
