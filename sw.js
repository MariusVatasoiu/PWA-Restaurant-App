var cacheWhitelist = ['cache-and-update-v1'];
var CACHE = cacheWhitelist[0];

self.addEventListener('install', function(evt) {
	console.log('The service worker is being installed.');
	
	evt.waitUntil(precache());
});

self.addEventListener('activate', function(event) {
  console.log('Activating new service worker...');

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(evt) {
	console.log('The service worker is serving the asset.');
	
	evt.respondWith(fromCache(evt.request).catch((error) => {
    console.log(error);
  }));

	evt.waitUntil(update(evt.request));
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
			'./',
			'./index.html',
			'./restaurant.html',
			'./data/restaurants.json',
			'./css/styles.css',
			'./css/responsive.css',
			'./js/main.js',
			'./js/restaurant_info.js',
			'./js/dbhelper.js',
			'./js/register_sw.js',
			'./img/1.jpg', './img/1-480.jpg',
			'./img/2.jpg', './img/2-480.jpg',
			'./img/3.jpg', './img/3-480.jpg',
			'./img/4.jpg', './img/4-480.jpg',
			'./img/5.jpg', './img/5-480.jpg',
			'./img/6.jpg', './img/6-480.jpg',
			'./img/7.jpg', './img/7-480.jpg',
			'./img/8.jpg', './img/8-480.jpg',
			'./img/9.jpg', './img/9-480.jpg',
			'./img/10.jpg', './img/10-480.jpg'
    ]);
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || fetch(request); //Promise.reject('no-match'); 
    });
  });
}

function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}