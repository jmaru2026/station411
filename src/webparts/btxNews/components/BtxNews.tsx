import * as React from 'react';
import styles from './BtxNews.module.scss';
import { IBtxNewsProps } from './IBtxNewsProps';
import { Icon } from '@fluentui/react';
import { getAllData } from '../services/SpService';

declare const google: any;

/* =====================================================
   TYPES
===================================================== */

interface IStation {
  id: number;
  title: string;

  address: string;
  address2: string;

  tollFree: string;
  phone: string;
  fax: string;

  email: string;
  manager: string;

  lat: number;
  lng: number;

  image: string;
  link: string;
}


/* ===================================================== */

const BtxNews: React.FC<IBtxNewsProps> = ({ List, gmapToken, context, dynamicZoom, TollFree, MainLine, Fax, Email, StoreManager }) => {

  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const [stations, setStations] = React.useState<IStation[]>([]);
  const [filteredStations, setFilteredStations] = React.useState<IStation[]>([]);
  const [selected, setSelected] = React.useState<IStation | null>(null);
  const [search, setSearch] = React.useState('');
  const [mapLoaded, setMapLoaded] = React.useState(false);


  const defaultZoom = parseInt(dynamicZoom?.valueOf(), 10)

  /* =====================================================
     DATA
  ===================================================== */
  React.useEffect(() => {

    const loadData = async () => {

      const data = await getAllData(List, context);

      setStations(data);
      setFilteredStations(data);

      // if (data.length > 0) {
      //   setSelected();
      // }
    };

    loadData();

  }, [List]);


  /* =====================================================
     FILTERED LIST
  ===================================================== */
  React.useEffect(() => {

    const result = stations.filter(s =>
      s.title.toLowerCase().indexOf(search.toLowerCase()) > -1
    );

    setFilteredStations(result);

  }, [search, stations]);

  /* =====================================================
     LOAD MAP
  ===================================================== */

  // React.useEffect(() => {

  //   const script = document.createElement("script");
  //   script.src = `https://maps.googleapis.com/maps/api/js?key=${"AIzaSyAKEce6-O8Jh7zoS2a-o0AO5K8MJAt_zwE"}`;
  //   script.async = true;

  //   script.onload = () => initMap();

  //   document.body.appendChild(script);

  // }, []);
  React.useEffect(() => {

    if ((window as any).google) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${gmapToken}`;
    script.async = true;

    script.onload = () => {
      setMapLoaded(true);
    };

    document.body.appendChild(script);

  }, []);

  React.useEffect(() => {

  if (!mapLoaded || stations.length === 0 || !mapRef.current) return;

  mapInstance.current = new google.maps.Map(mapRef.current, {
    center: { lat: stations[0].lat, lng: stations[0].lng },
    zoom: 4
  });

  renderMarkers(stations);

  //setSelected(stations[0]);

}, [mapLoaded, stations]);



  // const initMap = () => {

  //   if (!mapRef.current) return;

  //   mapInstance.current = new google.maps.Map(mapRef.current, {
  //     center: { lat: 39.5, lng: -98.35 },
  //     zoom: 4
  //   });

  //   renderMarkers(filteredStations);

  //   if (filteredStations.length > 0) {
  //     setSelected(filteredStations[0]);
  //   }
  // };

  /* =====================================================
     MARKERS (refresh on search)
  ===================================================== */

  React.useEffect(() => {
    renderMarkers(filteredStations);

    if (selected && !filteredStations.some(x => x.id === selected.id)) {
      setSelected(filteredStations[0] || null);
    }
  }, [filteredStations]);

  const renderMarkers = (list: IStation[]) => {

    if (!mapInstance.current) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    list.forEach(s => {

      const marker = new google.maps.Marker({
        position: { lat: s.lat, lng: s.lng },
        map: mapInstance.current,
        title: s.title
      });

      marker.addListener("click", () => selectStation(s));

      markersRef.current.push(marker);
    });
  };

  /* =====================================================
     SELECT
  ===================================================== */

  const selectStation = (station: IStation) => {

    setSelected(station);

    mapInstance.current.panTo({
      lat: station.lat,
      lng: station.lng
    });

    mapInstance.current.setZoom(defaultZoom);
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className={styles.wrapper}>

      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>

        <div className={styles.leftHeader}>
          <span className={styles.AllLocationsText}>All Locations</span>&ensp;<span>{filteredStations.length} stores available</span>
        </div>

        {/* SEARCH */}
        <div className={styles.searchWrap}>
          <Icon iconName="Search" style={{ color: '#d30000' }} />
          <input
            placeholder="Search location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            type='Search'
          />
        </div>

        {filteredStations.map(s => (
          <div
            key={s.id}
            className={`${styles.locationRow} ${selected?.id === s.id ? styles.active : ''}`}
            onClick={() => selectStation(s)}
          >
            <Icon iconName="POI" style={{ color: '#d30000' }} />
            <span style={{ fontWeight: 600 }}>{s.title}</span>
          </div>
        ))}
      </div>

      {/* MAP */}
      <div ref={mapRef} className={styles.map} />

      {/* DETAILS CARD */}
      {selected && (
        <div className={styles.detailsCard}>

          <button
            className={styles.close}
            onClick={() => setSelected(null)}
          >
            ✕
          </button>

          <img src={selected.image} className={styles.storeImage} />

          <h2 className={styles.title}>{selected.title}</h2>

          <hr className={styles.divider} />

          {/* Address */}
          <div className={styles.infoRow}>
            <Icon iconName="POI" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', borderRadius: '2px', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.address}</b>
              <b>{selected.address2}</b>
            </div>
          </div>

          {/* Toll Free */}
          <div className={styles.infoRow}>
            <Icon iconName="Phone" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', borderRadius: '2px', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.tollFree}</b>
              <span>{TollFree}</span>
            </div>
          </div>

          {/* Phone */}
          <div className={styles.infoRow}>
            <Icon iconName="Phone" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', borderRadius: '2px', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.phone}</b>
              <span>{MainLine}</span>
            </div>
          </div>

          {/* Fax */}
          <div className={styles.infoRow}>
            <Icon iconName="Print" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', borderRadius: '2px', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.fax}</b>
              <span>{Fax}</span>
            </div>
          </div>

          {/* Email */}
          <div className={styles.infoRow}>
            <Icon iconName="Mail" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', borderRadius: '2px', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.email}</b>
              <span>{Email}</span>
            </div>
          </div>

          {/* Manager */}
          <div className={styles.infoRow}>
            <Icon iconName="Contact" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', borderRadius: '2px', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.manager}</b>
              <span>{StoreManager}</span>
            </div>
          </div>

          <button className={styles.primaryBtn} onClick={() => { window.open(selected?.link, "_blank", "") }}><Icon iconName="Warehouse" />View Station Profile</button>

        </div>
      )}


    </div>
  );
};

export default BtxNews;