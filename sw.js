self.importScripts("js/lib/dexie.js");
var db = new Dexie("restaurants");
console.log('DB:', db);
db.version(1).stores({
  urls: 'url,data'
});
db.open();
//console.log(dexie);

var cacheWhitelist = ['cache-and-update-v1'];
var CACHE = cacheWhitelist[0];

self.addEventListener('install', function(evt) {
	console.log('The service worker is being installed.');
	
	evt.waitUntil(precache());
});

self.addEventListener('activate', function(event) {
  console.log('Activating new service worker...', event);

  event.waitUntil(
    //createDB()
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      ).then(() => { console.log('AAAAAAAAAAA'); });
    })
  );
});

self.addEventListener('fetch', event => {
	//console.log('The service worker is serving the asset.', event.request);
  
  if(event.request.method != 'GET') return;
  
  // check if the request is for JSON
  if(event.request.url.includes(':1337')){
    console.log('SERVE FROM INDEXEDDB');
    event.respondWith(fromDB(event.request).catch((error) => {
      console.log(error);
    }));
    event.waitUntil(updateDB(event.request));
  }else{
    event.respondWith(fromCache(event.request).catch((error) => {
      console.log(error);
    }));
  
    event.waitUntil(updateCache(event.request));
  }
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
			'./',
			'./index.html',
			'./restaurant.html',
			//'./data/restaurants.json',
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

function updateCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}


// functions for IndexedDB
function updateDB(request){
  return fetch(request).then(function (response) {
    console.log(response);
    // let resp = response.clone();
    // console.log(resp);
    return response.json();
  }).then( response => {
    console.log('updateDB:', response);
    return db.urls.put({url: request.url, data: response});
  });

  //
  // Put some data into it
  //
  // db.urls.put({url: "/test", data: {'test': 'test'}}).then (function(){
  //   //
  //   // Then when data is stored, read from it
  //   //
  //   return db.urls.get('/test');
  // }).then(function (url) {
  //   //
  //   // Display the result
  //   //
  //   console.log ("Nicolas has shoe size " + url.data.test);
  // }).catch(function(error) {
  //   //
  //   // Finally don't forget to catch any error
  //   // that could have happened anywhere in the
  //   // code blocks above.
  //   //
  //   console.log ("Ooops: " + error);
  // });
}

function fromDB(request){
  // var db = new Dexie("restaurants");

  console.log('FROM DB:', request);
  //return db.urls.get('/test1') || fetch(request);
  return  db.urls.get(request.url).then(function (matching) { console.log('MATCHING:', matching);

    if(matching){
      let response = new Response(JSON.stringify(matching.data));
      console.log('MATCHING DATA:', matching.data);

      //let newRequest = new Request(request.url, {body: JSON.stringify(matching.data)});

      console.log('NEW RESPONSE:', newRequest);
      return response; //Promise.reject('no-match'); 
    }
    return fetch(request); //Promise.reject('no-match'); 
  });
}