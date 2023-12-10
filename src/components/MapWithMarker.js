import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet'

import arrow from '../images/black-plane.png';
import checkpoint from '../images/checkpoint.png';
import upArrow from '../images/up-arrow.png';

import { ILS_WEST, ILS_EAST, polygonCoords, polygonCoordsOpp, STAR1, STAR2, STAR3, STAR4, STAR5, STAR6, STAR7, STAR_RELAY1, STAR_RELAY2 } from '../data/polygons';
import * as turf from '@turf/turf';
import nextImg from '../images/next.png'

function MapWithMarker() { 

  const [position, setPosition] = useState([28.412659463964406, 77.79712661649954]); // Initial position [28.547224, 77.065630]
  const [speed, setSpeed] = useState(140); // Adjust this value to change the speed (latitude/longitude units per update)
  const [direction, setDirection] = useState(-75.43); // Movement direction in degrees (45 degrees is northeast)
  const [warn, setWarn] = useState(90>=turf.distance([28.560268, 77.096308], position, {units: 'kilometers'}));
  const [altitude, setAltitude] = useState(10000);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [reqAlt, SetReqAlt] = useState();
  const [STAR, setSTAR] = useState(-1);
  const [next, setNext] = useState(0);
  const [rejected, setRejected] = useState(false);


  const customIcon = L.divIcon({
    html: `<img src=${arrow} alt="Custom Icon" height="20" width="20" style="transform: rotate(${direction-90}deg);"/>`,
    iconSize: [0, 0], // Icon size in pixels,
  });
  const checkpointIcon = L.divIcon({
    html: `<img src=${checkpoint} alt="Checkpoint Icon" height="20" width="20"/>`,
    iconSize: [0, 0], // Icon size in pixels,
  });
  const arrowIconWest = L.divIcon({
    html: `<img src=${upArrow} alt="Checkpoint Icon" height="16" width="16" style="transform: rotate(-77deg);"/>`,
    iconSize: [0, 0], // Icon size in pixels,
  });
  const arrowIconEast = L.divIcon({
    html: `<img src=${upArrow} alt="Checkpoint Icon" height="16" width="16" style="transform: rotate(103deg);"/>`,
    iconSize: [0, 0], // Icon size in pixels,
  });
  const nextIcon = L.divIcon({
    html: `<img src=${nextImg} alt="Checkpoint Icon" height="16" width="16" style="transform: rotate(103deg);"/>`,
    iconSize: [0, 0],
  })
  const StarMap = [null, STAR1, STAR2, STAR3, STAR4, STAR5, STAR6, STAR7, STAR_RELAY1, STAR_RELAY2, ILS_WEST, ILS_EAST]; // n=12
  // -----------------------------------
  
  useEffect(()=>{
    if (rejected){
      setTimeout(() => {
        setRejected(false);
      }, 30000);
    }
  }, [rejected]);
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 68) {
        setRoll((prevRoll)=>prevRoll+1);
      }
      else if (event.keyCode === 65){
        setRoll((prevRoll)=>prevRoll-1);
      }
      else if (event.keyCode === 87){
        setSpeed((prevSpeed)=>prevSpeed + 5);
      }
      else if (event.keyCode === 83){
        setSpeed((prevSpeed)=>prevSpeed - 5);
      }
      else if (event.keyCode === 85){
        setPitch((prevPitch)=>prevPitch+0.5);
      }
      else if (event.keyCode === 74){
        setPitch((prevPitch)=>prevPitch-0.5);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      // Clean up the event listener when the component unmounts
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
 
  // For movement:
  function moveObject(initialLat, initialLng, bearing, distance) {
    // Convert bearing to radians
    const bearingRad = (bearing * Math.PI) / 180;
    setDirection((prevDir)=>prevDir+roll);
    // Calculate the new latitude and longitude
    const radiusEarth = 6371; // Earth's radius in kilometers
    const lat1Rad = (initialLat * Math.PI) / 180;
    const lon1Rad = (initialLng * Math.PI) / 180;
  
    const newLat = Math.asin(
      Math.sin(lat1Rad) * Math.cos(distance / radiusEarth) +
        Math.cos(lat1Rad) * Math.sin(distance / radiusEarth) * Math.cos(bearingRad)
    );
  
    const newLon = lon1Rad + Math.atan2(
      Math.sin(bearingRad) * Math.sin(distance / radiusEarth) * Math.cos(lat1Rad),
      Math.cos(distance / radiusEarth) - Math.sin(lat1Rad) * Math.sin(newLat)
    );
  
    // Convert the new latitude and longitude back to degrees
    const newLatDegrees = (newLat * 180) / Math.PI;
    const newLonDegrees = (newLon * 180) / Math.PI;
    // Altitude:
    setAltitude((prevAlt)=>prevAlt+3280.84*(Math.tan(pitch*Math.PI/180)*distance));
    // Req Altitude (for ILS): 
    SetReqAlt(Math.tan(Math.PI/60)*turf.distance([28.537592867038587, 77.11018435483948], position, {units: 'feet'}));

    // Check for STAR arrival
    if (STAR!==-1){
      let dist1=turf.distance(StarMap[STAR][next], position, {units: 'kilometers'});
      if (dist1<=1 && next<StarMap[STAR].length-1) setNext((prevNext)=>prevNext+1);
      else if(dist1<=1) {setSTAR((prevSTAR)=>10); setNext((prevNext)=>0);}
    }
    else if(!rejected){
      if (turf.distance([28.181698954429642, 77.33129318855036], position, {units: 'kilometers'})<=2){
        let ans = window.confirm("WANT TO FOLLOW STAR1?");
        if (ans) {setSTAR(1); setNext(1);}
        else setRejected(true);
      }
      else if (turf.distance([28.419421040893084, 77.69577554080918], position, {units: 'kilometers'})<=2){
        let ans = window.confirm("WANT TO FOLLOW STAR2?");
        if (ans) {setSTAR(2); setNext(1);}
        else setRejected(true);
      }
      else if (turf.distance([28.876807541750182, 76.91107039234485], position, {units: 'kilometers'})<=2){
        let ans = window.confirm("WANT TO FOLLOW STAR3?");
        if (ans) {setSTAR(3); setNext(1);}
        else setRejected(true);
      }
      else if (turf.distance([28.27268974386187, 76.57837624723997], position, {units: 'kilometers'})<=2){
        let ans = window.confirm("WANT TO FOLLOW STAR4?");
        if (ans) {setSTAR(4); setNext(1);}
        else setRejected(true);
      }
      else if (turf.distance([28.293979617662586, 76.53047181802022], position, {units: 'kilometers'})<=2){
        let ans = window.confirm("WANT TO FOLLOW STAR5?");
        if (ans) {setSTAR(5); setNext(1);}
        else setRejected(true);
      }
      else if (turf.distance([28.90399453724155, 76.56760405758847], position, {units: 'kilometers'})<=2){
        let ans = window.confirm("WANT TO FOLLOW STAR6?");
        if (ans) {setSTAR(6); setNext(1);}
        else setRejected(true);
      }
      else if (turf.distance([28.332278030451135, 77.42489074867767], position, {units: 'kilometers'})<=2){
        let ans = window.confirm("WANT TO FOLLOW STAR7?");
        if (ans) {setSTAR(7); setNext(1);}
        else setRejected(true);
      }
    }
    // Inside Restricted Area Check:
    const dist = turf.distance([28.560268, 77.096308], [newLatDegrees, newLonDegrees], {units: 'kilometers'});
    if (dist<=95) setWarn(true);
    else setWarn(false);
    return [newLatDegrees, newLonDegrees];
  }
  
  // For Bearing:
  function calculateBearing(lat1, lon1, lat2, lon2) {
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;
  
    const y = Math.sin(lon2Rad - lon1Rad) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lon2Rad - lon1Rad);
  
    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    bearing = (bearing + 360) % 360; // Ensure the result is between 0 and 360 degrees
    
    
    return bearing;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(moveObject(position[0], position[1], direction, 0.000514444*speed));
    }, 1000); // Update position every second

    return () => clearInterval(interval);
  }, [position, direction, speed]);

   
 

    return (
        <>
        <MapContainer center={[28.560268, 77.096308]} zoom={9} style={{height: '90vh'}}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position} icon={customIcon}>
                <Popup>
                  Your Aircraft!
                </Popup>
            </Marker>
            {/* BackEnd: */}
            <Circle center={[28.560268, 77.096308]} radius={70000} color="grey" fillOpacity={0.05}>
                Restricted Area!
            </Circle>
            <Circle center={[28.560268, 77.096308]} radius={85000} color="red" fillOpacity={0.05}>
                Warn Area!
            </Circle>
            <Polygon positions={polygonCoords} color="#5ea181" />
            <Polygon positions={polygonCoordsOpp} color="#5ea181" />
            <Polyline positions={STAR1} color="#927119" />
            {STAR1.map((point, index) => (
              <Marker position={point} key={index} icon={checkpointIcon} />
            ))}
            <Polyline positions={STAR2} color="#927119" />
            {STAR2.map((point, index) => (
              <Marker position={point} key={index} icon={(STAR!==-1 && StarMap[STAR][next][0]==point[0])?nextIcon:checkpointIcon} />
            ))}
            <Polyline positions={STAR3} color="#927119" />
            {STAR3.map((point, index) => (
              <Marker position={point} key={index} icon={checkpointIcon} />
            ))}
            <Polyline positions={STAR4} color="#927119" />
            {STAR4.map((point, index) => (
              <Marker position={point} key={index} icon={checkpointIcon} />
            ))}
            <Polyline positions={STAR5} color="#927119" />
            {STAR5.map((point, index) => (
              <Marker position={point} key={index} icon={checkpointIcon} />
            ))}
            <Polyline positions={STAR6} color="#927119" />
            {STAR6.map((point, index) => (
              <Marker position={point} key={index} icon={checkpointIcon} />
            ))}
            <Polyline positions={STAR_RELAY1} color="#927119" />
            {STAR_RELAY1.map((point, index) => (
              <Marker position={point} key={index} icon={checkpointIcon} />
            ))}
            <Polyline positions={STAR_RELAY2} color="#927119" />
            {STAR_RELAY2.map((point, index) => (
              <Marker position={point} key={index} icon={checkpointIcon} />
            ))}
            <Polyline positions={STAR7} color="#927119" />
            {STAR7.map((point, index) => (
              <Marker position={point} key={index} icon={checkpointIcon} />
            ))}

            {/* ILS */}
            <Polyline positions={ILS_WEST} color="#927119" />
            {ILS_WEST.map((point, index) => (
              <Marker position={point} key={index} icon={(STAR!==-1 && StarMap[STAR][next][0]==point[0])?nextIcon:arrowIconWest} />
            ))}
            <Polyline positions={ILS_EAST} color="#927119" />
            {ILS_EAST.map((point, index) => (
              <Marker position={point} key={index} icon={arrowIconEast} />
            ))}
        </MapContainer>
        <div>
          Speed: {speed}Knots <br/>
          Direction: {direction}Deg | Altitude: {altitude}ft | Pitch: {pitch}Deg<br/>
          Warn: {warn? "true" : "false"} | Req. Altitude: {reqAlt}ft | STAR: {STAR} | Roll: {roll}
        </div>
      </>
  );
  }
  
  export default MapWithMarker;
  