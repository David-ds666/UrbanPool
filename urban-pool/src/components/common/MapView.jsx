function MapView() {
  return (
    <iframe
      title="map"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      src="https://www.google.com/maps?q=Mohali&z=13&output=embed"
    />
  );
}

export default MapView;