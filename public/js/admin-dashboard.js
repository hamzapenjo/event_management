// Funkcija za dohvaćanje zaštićenih podataka
async function fetchProtectedData() {
    const token = localStorage.getItem('token');  // Dohvati token iz localStorage
    
    const response = await fetch('/admin/protected-data', {  // Promijeni URL da izbjegneš poklapanje
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Pošalji token u zaglavlju
      }
    });
  
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      
      // Primjer prikaza podataka na grafikone
      const eventData = data.events;
      const userData = data.users;
  
      // Event Chart
      const ctxEvent = document.getElementById('eventChart').getContext('2d');
      new Chart(ctxEvent, {
        type: 'line',
        data: {
          labels: eventData.labels,
          datasets: [{
            label: 'Events per month',
            data: eventData.values,
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false
          }]
        }
      });
  
      // User Chart
      const ctxUser = document.getElementById('userChart').getContext('2d');
      new Chart(ctxUser, {
        type: 'doughnut',
        data: {
          labels: userData.labels,
          datasets: [{
            label: 'User Status',
            data: userData.values,
            backgroundColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)']
          }]
        }
      });
  
    } else {
      alert('Greška pri dohvaćanju podataka: ' + response.status);
    }
  }
  
  // Pozovi funkciju kada se stranica učita
  document.addEventListener('DOMContentLoaded', fetchProtectedData);
  