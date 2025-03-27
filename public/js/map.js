// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = map_Token;
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 9, // starting zoom
});



const marker1 = new mapboxgl.Marker({color: "red"})
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h6>${listing.location}, ${listing.country}</h6><P>Exact location will be provided after booking</P>`))
        .addTo(map);