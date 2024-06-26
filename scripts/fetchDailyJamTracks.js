export async function fetchDailyJamTracks(client) {
    let jamTracks = { dailyTracks: [], upcomingTracks: [] };

    try {
        await client.login();

        const eventFlags = await client.getBREventFlags();
        const channel = eventFlags?.channels['client-events'];
        const states = channel?.states || [];

        const currentDate = new Date();
        const tomorrowDate = new Date();
        tomorrowDate.setDate(currentDate.getDate() + 1);

        states
            .flatMap(state => state.activeEvents || [])
            .filter(activeEvent => activeEvent.eventType.startsWith('PilgrimSong.'))
            .forEach(activeEvent => {
                const eventType = activeEvent.eventType.split('.')[1];
                const activeSince = new Date(activeEvent.activeSince);
                const activeUntil = new Date(activeEvent.activeUntil);
                const isDaily = activeSince < currentDate && activeUntil > currentDate;
                const isUpcoming = activeSince.getDate() === tomorrowDate.getDate() &&
                    activeSince.getMonth() === tomorrowDate.getMonth() &&
                    activeSince.getFullYear() === tomorrowDate.getFullYear();

                if (!jamTracks.dailyTracks.includes(eventType)) {
                    if (isDaily) {
                        jamTracks.dailyTracks.push(eventType);
                    } else if (isUpcoming) {
                        jamTracks.upcomingTracks.push(eventType);
                    }
                }
            });
    } catch (error) {
        console.error('Error fetching daily jam tracks:', error);
    }

    return jamTracks;
}
