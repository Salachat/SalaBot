export default async (_, thread) => {
    await thread.join();
};
