import * as React from 'react';
import styles from './BtxNews.module.scss';
import { IBtxNewsProps } from './IBtxNewsProps';
import { Icon } from '@fluentui/react';
import { getAllData } from '../services/SpService';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* =====================================================
   FIX LEAFLET ICON ISSUE
===================================================== */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

const BtxNews: React.FC<IBtxNewsProps> = ({
  List,
  context,
  dynamicZoom,
  TollFree,
  MainLine,
  Fax,
  Email,
  StoreManager
}) => {

  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<L.Map | null>(null);
  const markersRef = React.useRef<L.Marker[]>([]);

  const [stations, setStations] = React.useState<IStation[]>([]);
  const [filteredStations, setFilteredStations] = React.useState<IStation[]>([]);
  const [selected, setSelected] = React.useState<IStation | null>(null);
  const [search, setSearch] = React.useState('');

  const defaultZoom = parseInt(dynamicZoom?.valueOf(), 10) || 8;

  /* =====================================================
     DATA
  ===================================================== */
  React.useEffect(() => {
    const loadData = async () => {
      const data = await getAllData(List, context);

      const sortedData = data.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );

      setStations(sortedData);
      setFilteredStations(sortedData);
    };

    loadData();
  }, [List]);

  /* =====================================================
     FILTER
  ===================================================== */
  React.useEffect(() => {
    const result = stations
      .filter(s =>
        s.title.toLowerCase().indexOf(search.toLowerCase()) > -1
      )
      .sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );

    setFilteredStations(result);
  }, [search, stations]);

  /* =====================================================
     INIT MAP
  ===================================================== */
  React.useEffect(() => {
    if (!mapRef.current || stations.length === 0) return;

    if (mapInstance.current) return;

    const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png')
    // L.tileLayer(
    //   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    //   {
    //     attribution: '&copy; OpenStreetMap contributors'
    //   }
    // );

    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri'
      }
    );

    mapInstance.current = L.map(mapRef.current).setView(
      [stations[0].lat, stations[0].lng],
      4
    );

    satelliteLayer.addTo(mapInstance.current);

    L.control.layers(
      {
        "Street": streetLayer,
        "Satellite": satelliteLayer
      }
    ).addTo(mapInstance.current);

    renderMarkers(stations);

  }, [stations]);

  /* =====================================================
     UPDATE MARKERS ON FILTER
  ===================================================== */
  React.useEffect(() => {
    renderMarkers(filteredStations);

    if (selected && !filteredStations.some(x => x.id === selected.id)) {
      setSelected(filteredStations[0] || null);
    }
  }, [filteredStations]);

  /* =====================================================
     MARKERS
  ===================================================== */
  const renderMarkers = (list: IStation[]) => {
    if (!mapInstance.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    list.forEach(s => {
      const marker = L.marker([s.lat, s.lng])
        .addTo(mapInstance.current!)
        // .bindPopup(`<b>${s.title}</b><br/>${s.address}`)
        // .bindTooltip(s.title, {
        //   permanent: true,
        //   direction: 'top'
        // })
        .on('click', () => selectStation(s));

      markersRef.current.push(marker);
    });
  };

  /* =====================================================
     SELECT
  ===================================================== */
  const selectStation = (station: IStation) => {

    setSelected(station);

    mapInstance.current?.setView(
      [station.lat, station.lng],
      defaultZoom
    );

    let marker = null;

    for (let i = 0; i < markersRef.current.length; i++) {
      const m = markersRef.current[i];

      if (
        m.getLatLng().lat === station.lat &&
        m.getLatLng().lng === station.lng
      ) {
        marker = m;
        break;
      }
    }

    if (marker) {
      marker.openPopup();
    }
  };

  /* =====================================================
     RESET MAP
  ===================================================== */
  const resetMap = () => {
    setSelected(null);

    if (stations.length > 0) {
      mapInstance.current?.setView(
        [stations[0].lat, stations[0].lng],
        4
      );
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className={styles.wrapper}>

      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <div className={styles.leftHeader}>
          <span className={styles.AllLocationsText}>All Locations</span>&ensp;
          <span>{filteredStations.length} stores available</span>
        </div>

        {/* SEARCH */}
        <div className={styles.searchWrap}>
          <Icon iconName="Search" style={{ color: '#d30000' }} />
          <input
            placeholder="Search location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            type='search'
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

          <button className={styles.close} onClick={resetMap}>
            ✕
          </button>

          <img src={selected.image} className={styles.storeImage} />

          <h2 className={styles.title}>{selected.title}</h2>

          <hr className={styles.divider} />

          <div className={styles.infoRow}>
            <Icon iconName="POI" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.address}</b>
              <b>{selected.address2}</b>
            </div>
          </div>

          <div className={styles.infoRow}>
            <Icon iconName="Phone" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.tollFree}</b>
              <span>{TollFree}</span>
            </div>
          </div>

          <div className={styles.infoRow}>
            <Icon iconName="Phone" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.phone}</b>
              <span>{MainLine}</span>
            </div>
          </div>

          <div className={styles.infoRow}>
            <Icon iconName="Print" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.fax}</b>
              <span>{Fax}</span>
            </div>
          </div>

          <div className={styles.infoRow}>
            <Icon iconName="Mail" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.email}</b>
              <span>{Email}</span>
            </div>
          </div>

          <div className={styles.infoRow}>
            <Icon iconName="Contact" style={{ backgroundColor: 'rgb(242 234 234)', color: '#D30000', padding: '10px' }} />
            <div className={styles.divwraping}>
              <b>{selected.manager}</b>
              <span>{StoreManager}</span>
            </div>
          </div>

          <button
            className={styles.primaryBtn}
            onClick={() => window.open(selected?.link, "_blank")}
          >
            <Icon iconName="Warehouse" /> View Station Profile
          </button>

        </div>
      )}

    </div>
  );
};

export default BtxNews;