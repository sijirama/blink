import React, { useEffect, useState, useCallback } from 'react';
import {
    AlertTriangle,
    MapPin,
    Clock,
    AlertCircle,
    ThumbsUp,
    Loader2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert as AlertType, Flag as FlagType } from '@/types/alert';
import moment from 'moment';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { toast } from 'sonner';
import { socket } from '@/lib/socket';

interface ReportCardProps {
    id?: number;
    open?: boolean;
}

const fetchAlertData = async (alertId: number): Promise<AlertType | null> => {
    try {
        const response = await fetch(`/api/alert/${alertId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.alert;
    } catch (error) {
        console.error('Error fetching alert data:', error);
        return null;
    }
};

const ReportCard = React.memo(({ id }: ReportCardProps) => {
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);
    const [userHasFlagged, setUserHasFlagged] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const isAuthenticated = useIsAuthenticated();
    const { user }: any = useAuthUser();

    const fetchAlert = useCallback(async () => {
        if (id) {
            setLoading(true);
            const data = await fetchAlertData(id);
            setAlert(data);

            if (data && user) {
                const currentUserId = user.id;
                const hasFlag = data.Flags.some(
                    (flag: FlagType) => flag.UserID === currentUserId
                );
                setUserHasFlagged(hasFlag);
            } else {
                setUserHasFlagged(false);
            }

            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        fetchAlert();

        if (id && socket.connected) {
            console.log("i am trying to join this room")
            socket.emit('join_alert_room', id);
        }

        socket.on('alert_updated', (updatedAlert: AlertType) => {
            console.log(updatedAlert)
            setAlert(updatedAlert);
            // Check if the current user has flagged
            if (user) {
                const hasFlag = updatedAlert.Flags.some(
                    (flag: FlagType) => flag.UserID === user.id
                );
                setUserHasFlagged(hasFlag);
            }
        });

        return () => {
            socket.off('alert_updated');
            socket.emit('leave_alert_room', id);
        }

    }, [fetchAlert, id, user]);

    const handleAction = async (type: 'Verify' | 'Dismiss') => {
        if (id && !userHasFlagged && user) {
            const actionState = type === 'Verify' ? setIsVerifying : setIsDismissing;
            actionState(true);

            try {
                const response = await fetch(`/api/flag/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ Type: type })
                });

                if (!response.ok) {
                    throw new Error('Failed to submit action');
                }

                setUserHasFlagged(true);
                toast.success(`Alert ${type.toLowerCase()}ed successfully. You can no longer flag this alert.`);
            } catch (error) {
                setUserHasFlagged(false);
                console.error(`Error performing ${type.toLowerCase()} action:`, error);
                toast.error(`Failed to ${type.toLowerCase()} alert. Please try again.`);
            } finally {
                actionState(false);
                await fetchAlert(); // Refresh data
            }
        }
    };

    const formatDescription = (description: string) => {
        return description.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line.trim()}
                {index < description.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    const truncateDescription = (description: string, maxLines: number) => {
        const lines = description.split('\n');
        if (lines.length <= maxLines) return description;
        return lines.slice(0, maxLines).join('\n') + '...';
    };

    if (loading) {
        return (
            <div className="p-4">
                <Skeleton className="w-full h-6 mb-2" />
                <Skeleton className="w-3/4 h-4 mb-2" />
                <Skeleton className="w-full h-20" />
            </div>
        );
    }

    if (!alert) {
        return (
            <div className="p-4 text-center">
                <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-600">No alert found</p>
            </div>
        );
    }

    const urgencyColor =
        alert.Urgency > 7
            ? 'text-red-600'
            : alert.Urgency > 4
                ? 'text-orange-500'
                : 'text-yellow-500';
    const formattedDate = moment(alert.CreatedAt).format('Do [of] MMM [around] h:mm A');

    return (
        <div className="p-4 font-poppins">
            <div className="mb-3">
                <div className="mb-2">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">{alert.Title}</h2>
                    <div className="flex items-center">
                        <AlertTriangle className={`${urgencyColor} text-xl mr-2`} />
                        <Badge variant="outline" className={`${urgencyColor} border-current`}>
                            Urgency: {alert.Urgency}/10
                        </Badge>
                    </div>
                </div>
                <p className="flex items-center space-x-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                        {alert.Location.Latitude.toFixed(4)}, {alert.Location.Longitude.toFixed(4)}
                    </span>
                </p>
            </div>

            <div className="mb-4">
                <p className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Reported {formattedDate}</span>
                </p>
                <div className="text-gray-700 text-sm">
                    {isDescriptionExpanded
                        ? formatDescription(alert.Description)
                        : formatDescription(truncateDescription(alert.Description, 3))}
                </div>
                {alert.Description.split('\n').length > 3 && (
                    <Button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        variant="ghost"
                        className="mt-2 p-0 h-auto"
                    >
                        {isDescriptionExpanded ? (
                            <><ChevronUp className="w-4 h-4 mr-1" /> Show Less</>
                        ) : (
                            <><ChevronDown className="w-4 h-4 mr-1" /> Read More</>
                        )}
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-3">
                <div className="flex items-center space-x-2">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{alert.Flags.filter((flag) => flag.Type == "Verify")?.length || 0} Verification(s)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{alert.Status}</Badge>
                </div>
            </div>

            {isAuthenticated && (
                <div className="mt-4">
                    {userHasFlagged ? (
                        <p className="text-sm text-gray-600">You have already flagged this alert. No further action can be taken.</p>
                    ) : (
                        <div className="flex justify-start gap-2">
                            <Button
                                onClick={() => handleAction('Verify')}
                                disabled={isVerifying || isDismissing}
                                variant="outline"
                                className="flex items-center"
                            >
                                {isVerifying ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ThumbsUp className="w-4 h-4 text-green-500" />
                                )}
                                <span className="ml-2">Verify</span>
                            </Button>
                            <Button
                                onClick={() => handleAction('Dismiss')}
                                disabled={isVerifying || isDismissing}
                                variant="outline"
                                className="flex items-center"
                            >
                                {isDismissing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="ml-2">Dismiss</span>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default ReportCard;
