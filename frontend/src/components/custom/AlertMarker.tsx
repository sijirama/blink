import { Marker } from 'react-map-gl';
import { Alert } from '@/types/alert';
import { useInterface } from '@/store/interface';

interface MarkerProps {
    alert: Alert;
}

const AlertMarker = ({ alert }: MarkerProps) => {

    const radius = 100
    const { onOpen } = useInterface()
    const radiusInPixels = (radius || 1000) / 2; // Convert to pixels

    return (
        <Marker key={alert.ID} latitude={alert.Location.Latitude} longitude={alert.Location.Longitude}>
            <div
                onClick={() => onOpen("reportCard", { alertId: alert.ID })}
                className="pulse-circle"
                style={{
                    width: `${radiusInPixels * 2}px`,
                    height: `${radiusInPixels * 2}px`,
                    marginLeft: `-${radiusInPixels}px`, // Center the circle
                    marginTop: `-${radiusInPixels}px`,
                }}
            >
                <div className="pulse-inner" />
            </div>
        </Marker>
    );
};

export default AlertMarker;

