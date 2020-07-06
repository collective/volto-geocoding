import React from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import './OSMMap.css';

const OSMMap = ({ position, address, zoom = 15 }) => (
  <Map center={position} zoom={zoom} id="geocoded-result">
    <TileLayer
      attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={position}>
      <Popup>{address}</Popup>
    </Marker>
  </Map>
);

OSMMap.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number), // [lat, lng]
  address: PropTypes.string,
  zoom: PropTypes.number,
};

export default OSMMap;
