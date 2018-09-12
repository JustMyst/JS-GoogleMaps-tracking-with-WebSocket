
                                                //Inicjacja podstawowych zmiennych.
        let uluru, map, marker;
        let ws;
        let player={}
        let nick=window.prompt("podaj nick")
        function initMap() {                    // dodanie własnego markera i mapy
            uluru = {lat: 50.068160, lng: 18.941041};
            map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: uluru,
            keyboardShortcuts: false
            });
            marker = new google.maps.Marker({
                position: uluru,
                map: map,
                animation: google.maps.Animation.BOUNCE,
        });

                                                // Event po ruchu myszką.
        google.maps.event.addListener(map, 'mousemove', function(e) {
                marker.setPosition(e.latLng);  // latlng zwraca wartosci w dziwnej funkcji, ktorych nie mozna uzyc.
                var lat = marker.getPosition().lat(); // wiec trzeba pobrac na nowo pozycje od markera
                var lng = marker.getPosition().lng();
                let wsData={lat:lat, lng:lng, id:nick}
                ws.send(JSON.stringify(wsData))  // Wysłanie danych do WebSocketa
            });
        getLocalization()
        startWebSocket()
        addKeyboardEvents()
      }
                                                // funkcje klawiszy
      function addKeyboardEvents(){
          window.addEventListener("keydown", poruszMarkerem)
      }
      function poruszMarkerem(ev){
          let lat = marker.getPosition().lat();
          let lng = marker.getPosition().lng();
        switch(ev.code){                        // zmiana położenia po klawiszu.
            case 'ArrowUp':
            lat+=0.1;
            break;
            case 'ArrowDown':
            lat-=0.1;            
            break;
            case 'ArrowLeft':
            lng-=0.1;
            break;
            case 'ArrowRight':
            lng+=0.1;
            break;
        }
        let position={lat,lng}
        let wsData={lat:lat, lng:lng, id:nick}
        marker.setPosition(position)        
        ws.send(JSON.stringify(wsData))         // Wysłanie danych do WebSocketa
      }

      function startWebSocket(){                // Stworzenie websocketa
      
        let url= 'ws://szkolenia.design.net.pl:8010'
        ws = new WebSocket(url);
        ws.addEventListener('open',onWSOpen);
        ws.addEventListener('message',onWSMessage);
      }

      function onWSOpen(data){                  // otawrcie WS
          console.log(data)
      }
      function onWSMessage(e){                  // Zmiany po sygnale od WS
          
          let data=JSON.parse(e.data)
          console.log("data received",data)     
                                                // Dodanie gracza do listy, jeśli go nie ma
          if(!player['user'+ data.id]&&data.id!==nick){ // nie moze miec tego samego nicku
              player['user'+ data.id]= new google.maps.Marker({
                  position: {lat:data.lat,lng:data.lng},
                  map:map
              })
          }else if(data.id!==nick){             // Zmiana pozycji, jesli istnieje.
            player['user'+ data.id].position=
            {
                lat:data.lat,lng:data.lng
            }
            player['user'+ data.id].setPosition(player['user'+ data.id].position) //ustalenie pozycji gracza


        }
        
          
    }
          
      
      function getLocalization(){               // Prośba o geolokalizacje.
        navigator.geolocation.getCurrentPosition(geoOk,geoFail)
      }
      function geoOk(data){                     // Powodzenie prośby.
          console.log(data)
          let coords = {
              lat: data.coords.latitude,
              lng: data.coords.longitude}
            map.setCenter(coords);
            marker.setPosition(coords);
      }
      function geoFail(err){                    // Niepowodzenie prośby.
          console.log(err)
      }