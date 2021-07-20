export default async (_, thread) => {
    // Auto join threads for moderative reasons
    await thread.join();
};
