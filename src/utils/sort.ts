
import { ICustomChannel } from '../interfaces/guild.interface';
interface SortedChannel {
    id: string;
    title: string;
    subChannels: ICustomChannel[];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortChannels(channels: any): SortedChannel[] {
    const sortedChannels: SortedChannel[] = [];
    const unCategorized: SortedChannel = {
        id: "0",
        title: "unCategorized",
        subChannels: []
    };

    for (const channel of channels) {
        if (channel.parent_id === null) {
            const subChannels = channels.filter((c: ICustomChannel) => c.parent_id === channel.id);
            if (subChannels.length > 0) {
                sortedChannels.push({
                    id: channel.id,
                    title: channel.name || "",
                    subChannels,
                });
            } else {
                unCategorized.subChannels.push({ ...channel, parent_id: channel.id });
            }
        }
    }

    if (unCategorized.subChannels.length > 0) {
        sortedChannels.push(unCategorized);
    }

    return sortedChannels;
}

function sortByHandler(sortBy: string): Record<string, 1 | -1> {
    let sortParams: Record<string, 1 | -1> = {};
    sortParams = sortBy.split(',').reduce((acc, curr) => {
        const [field, order] = curr.split(':');
        acc[field] = order === 'desc' ? -1 : 1;
        return acc;
    }, sortParams);
    return sortParams;
}




export default {
    sortChannels,
    sortByHandler
}