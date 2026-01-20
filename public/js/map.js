mapboxgl.accessToken = mapToken;

// Safety check
if (
  !listing ||
  !listing.geometry ||
  !Array.isArray(listing.geometry.coordinates) ||
  listing.geometry.coordinates.length !== 2
) {
  console.error("Invalid coordinates:", listing?.geometry);
} else {
  const [lng, lat] = listing.geometry.coordinates;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [lng, lat],
    zoom: 9
  });

  // ✅ Marker
  new mapboxgl.Marker({ color: "red" })
    .setLngLat([lng, lat])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${listing.title}</h4>
         <p>Exact location will be provided after booking!</p>`
      )
    )
    .addTo(map);
}


  


