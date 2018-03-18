var CACHE = 'cache-and-update';

self.addEventListener('install', function(evt) {
	console.log('The service worker is being installed.');
	
	evt.waitUntil(precache());
});


self.addEventListener('fetch', function(evt) {
	console.log('The service worker is serving the asset.');
	
	evt.respondWith(fromCache(evt.request));

	evt.waitUntil(update(evt.request));
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
			'./index.html',
			'./restaurant.html',
			'./css/styles.css',
			'./js/main.js',
			'./img'
    ]);
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
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


// const staticCacheName = 'restaurant-static-v1';
// const contentImgsCache = 'restaurant-content-imgs';
// const allCaches = [staticCacheName, contentImgsCache];

// self.addEventListener('install', function(event) {
//   event.waitUntil(
//     caches.open(staticCacheName).then(function(cache) {
//       return cache.addAll([
//         '/',
//         '/index.html',
//         '/restaurant.html',
//         '/js/dbhelper.js',
//         '/js/main.js',
//         '/js/restaurant_info.js',
//         '/css/responsive.css',
//         '/css/style.css'
//       ]);
//     })
//   )
// });

// self.addEventListener('fetch', function(event) {
//   // event.respondWith(
//   //   caches.match(event.request)
// 	// );
	
// 	event.respondWith(
// 		caches.match(event.request).then(function (response) {
// 			return response || fetch(event.request);
// 		})
// 	)
// });