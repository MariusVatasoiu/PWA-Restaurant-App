let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
	fetchCuisines();
	registerServiceWorker();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
	const article = document.createElement('article');
  article.className = 'flex-container';
  article.setAttribute('aria-label', restaurant.name);
	const articleThumb = document.createElement('div');
	articleThumb.className = 'col-sm-6 col-md-5';
	const articleContent = document.createElement('div');
	articleContent.className = 'col-sm-6 col-md-7 restaurant-content';

	/* Thumbnail */
  const image = document.createElement('img');
	image.className = 'restaurant-img';
	image.alt = restaurant.name;
	image.src = DBHelper.imageUrlForRestaurant(restaurant);
	
	// Set srcset for responsive
	const image480 = image.src.replace(/(\.[\w\d_-]+)$/i, '-480$1')
	image.setAttribute('srcset', `${image480} 480w, ${image.src} 800w`);
	image.setAttribute('sizes', '(max-width: 576px) 480px, (max-width: 1200px) 480px');

	articleThumb.append(image);
	article.append(articleThumb);

	/* Content */
  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  articleContent.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  articleContent.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  articleContent.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', 'View Details about '+ restaurant.name);
	articleContent.append(more);
	article.append(articleContent);

  return article;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

registerServiceWorker = () => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('sw.js', {
			scope: './'
		}).then((registration) => {
      var serviceWorker;
      if (registration.installing) {
          serviceWorker = registration.installing;
          console.log('installing');
      } else if (registration.waiting) {
          serviceWorker = registration.waiting;
          console.log('waiting');
      } else if (registration.active) {
          serviceWorker = registration.active;
          console.log('active');
      }
      if (serviceWorker) {
          // logState(serviceWorker.state);
          serviceWorker.addEventListener('statechange', function (e) {
              // logState(e.target.state);
              console.log(e.target.state);
          });
      }
    }).catch(error => {
      console.log(error);
    });
		// navigator.serviceWorker.register('/sw.js')
		// .then(function(reg) {
		// 	// registration worked
		// 	console.log('Registration succeeded. Scope is ' + reg.scope);
		// }).catch(function(error) {
		// 	// registration failed
		// 	console.log('Registration failed with ' + error);
		// });
	}
}