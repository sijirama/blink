import Map, { GeolocateControl, Marker, NavigationControl } from 'react-map-gl';
import { useLocationStore } from '@/store/location';
import useAlertStore from '@/store/alert';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { avatarImageUrl } from '@/lib/avatar';
import { socket } from '@/lib/socket';
import { useMemo } from 'react';
import AlertMarker from './AlertMarker';

import 'mapbox-gl/dist/mapbox-gl.css';
//const MapBoxSiji = "mapbox://styles/sijiramakun/cm04mgec700ej01qtc1ekexg4"
const MapBoxSiji = "mapbox://styles/mapbox/standard"

export default function MapComponent() {
    const { coords } = useLocationStore();
    const { alerts } = useAlertStore()
    const auth = useAuthUser();

    const alertsMarkers = useMemo(() => alerts.map((alert) => {
        return (
            <AlertMarker alert={alert} key={alert.ID} />
        )
    }), [alerts])

    if (!coords?.longitude || !coords.latitude) {
        return null
    }

    const handleMapClick = (event: any) => {
        console.log('Map clicked', event.lngLat);
    }

    return (
        <section className='w-full h-full'>
            <Map
                reuseMaps={true}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_KEY}
                initialViewState={{
                    longitude: coords?.longitude,
                    latitude: coords?.latitude,
                    zoom: 17,
                    pitch: 60,
                }}
                onClick={handleMapClick}
                style={{ width: "100%", height: "100vh" }}
                mapStyle={MapBoxSiji}
            >
                <NavigationControl />
                <GeolocateControl />
                {alertsMarkers}
                {
                    <Marker latitude={coords.latitude} longitude={coords.longitude}>
                        {
                            auth ? (
                                <div
                                    className={`cursor-pointer z-50 rounded-full w-8 h-8 md:w-10 md:h-10 bg-center bg-cover bg-no-repeat border ${socket.connected
                                        ? 'border-green-500 border-2'
                                        : 'border-purple-300'
                                        }`}
                                    style={{
                                        backgroundImage: `url(${avatarImageUrl(auth)})`,
                                    }}
                                    aria-label="User menu"
                                />

                            ) : (
                                <div className="bg-blue-500 animate-pulse p-2 rounded-full text-white">

                                </div>
                            )
                        }
                    </Marker>
                }

            </Map>
        </section>
    )
}

