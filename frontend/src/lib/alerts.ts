import { socket } from "./socket";


export const joinAlertRoom = (latitude: number, longitude: number, radius: number) => {
    if (!socket) return;
    console.log("Emitting 'join_chookeye' event");
    try {
        console.log(latitude.toString(), longitude.toString(), String(radius))
        socket.emit('join_chookeye', latitude.toString(), longitude.toString(), String(radius));
        console.log(`Joining chookeye for coordinates: ${latitude}, ${longitude}`);
    } catch (err) {
        console.error("Failed to join chookeye: ", err);
    }
};
