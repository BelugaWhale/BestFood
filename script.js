// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '★';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '½';
        } else {
            starsHTML += '☆';
        }
    }
    
    return starsHTML;
}

// Create restaurant card
function createRestaurantCard(restaurant) {
    return `
        <div class="restaurant-card">
            <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image">
            <div class="restaurant-info">
                <h3 class="restaurant-name">${restaurant.name}</h3>
                <p class="restaurant-details">${restaurant.address}</p>
                <div class="restaurant-rating">
                    <span class="stars">${generateStars(restaurant.rating)}</span>
                    <span>${restaurant.rating.toFixed(1)}</span>
                </div>
                <p class="restaurant-reviews">${restaurant.reviews.toLocaleString()} reviews</p>
            </div>
        </div>
    `;
}

// Display restaurants for a city
async function displayRestaurants(city) {
    try {
        const response = await fetch(`http://localhost:5000/api/restaurants/${city}`);
        const restaurants = await response.json();
        
        const grid = document.querySelector('.restaurant-grid');
        const currentCitySpan = document.querySelector('.current-city');
        
        // Update current city
        currentCitySpan.textContent = city;
        
        // Clear and populate grid
        grid.innerHTML = restaurants
            .map(restaurant => createRestaurantCard(restaurant))
            .join('');
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        document.querySelector('.restaurant-grid').innerHTML = 
            '<p class="error">Error loading restaurants. Please try again later.</p>';
    }
}

// Load cities from the backend
async function loadCities() {
    try {
        const response = await fetch('http://localhost:5000/api/cities');
        const cities = await response.json();
        
        const cityList = document.querySelector('.city-list');
        cityList.innerHTML = cities
            .map((city, index) => `
                <button class="city-btn ${index === 0 ? 'active' : ''}">${city}</button>
            `)
            .join('');
        
        // Set up city button click handlers
        document.querySelectorAll('.city-btn').forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                document.querySelector('.city-btn.active')?.classList.remove('active');
                button.classList.add('active');
                
                // Display restaurants for selected city
                displayRestaurants(button.textContent);
            });
        });
        
        // Initialize with first city
        if (cities.length > 0) {
            displayRestaurants(cities[0]);
        }
    } catch (error) {
        console.error('Error loading cities:', error);
        document.querySelector('.city-list').innerHTML = 
            '<p class="error">Error loading cities. Please refresh the page.</p>';
    }
}

// Initialize the application
loadCities();
