import React from 'react';
import './Modal.scss';

const Modal = ({ isOpen, close, hotel, attractionsData }) => {
  if (!isOpen) return null;

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const attractionsWithDistance = attractionsData.map(attraction => ({
    ...attraction,
    distance: calculateDistance(
      hotel?.hotel.latitude,
      hotel?.hotel.longitude,
      attraction?.latitude,
      attraction?.longitude
    )
  }));

  const walkableAttractions = attractionsWithDistance.filter(attraction => attraction.distance <= 1).sort((a, b) => a.distance - b.distance);
  const longDistanceAttractions = attractionsWithDistance.filter(attraction => attraction.distance > 1).sort((a, b) => a.distance - b.distance);
  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={close}>Close</button>
        <h3>{hotel?.hotel.hotelName}</h3>
        <p>{hotel?.hotel.address}</p>
        <p>Price : {hotel?.hotel.budget}/ room</p>
        <p>Accomodation : {hotel?.hotel.accommodationCapacity}</p>
        <p>Rating : {hotel?.hotel.starRating}</p>
        <p>Review : {hotel?.hotel.review}</p>
        <p>Check in Time : {hotel?.hotel.checkInTime}</p>
        <p>Check out Time : {hotel?.hotel.checkOutTime}</p>
        <h4>Facilities</h4>
        <ul>
          {hotel?.hotel.facilities.map((facility, index) => (
            <li key={index}>{facility}</li>
          ))}
        </ul>
        <div className='attractions-container'>
        <div>
        <h4>Nearby Attractions (Walkable Distance)</h4>
        <ul>
          {walkableAttractions.length > 0 ? walkableAttractions.map((attraction, index) => (
            <li key={index}>{attraction.name} - {attraction.distance.toFixed(2)} km away</li>
          )) : <li>No walkable attractions nearby.</li>}
        </ul>
        </div>
        <div>
        <h4>Nearby Attractions (Long Distance)</h4>
        <ul>
          {longDistanceAttractions.length > 0 ? longDistanceAttractions.map((attraction, index) => (
            <li key={index}>{attraction.name} - {attraction.distance.toFixed(2)} km away</li>
          )) : <li>No long distance attractions nearby.</li>}
        </ul></div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
