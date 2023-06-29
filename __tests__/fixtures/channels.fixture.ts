import { IChannel } from '@togethercrew.dev/db';
import { Connection } from 'mongoose';

export const discordResponseChannelOne = {
    id: "681946187490000801",
    type: 4,
    name: "channelOne",
    position: 0,
    flags: 0,
    parent_id: "681946187490000803",
    guild_id: "681946187490000902",
    Permission_overwrites: []
};

export const discordResponseChannelTwo = {
    id: "681946187490000802",
    type: 4,
    name: "channelTwo",
    position: 0,
    flags: 0,
    parent_id: null,
    guild_id: "681946187490000902",
    Permission_overwrites: []
};


export const discordResponseChannelThree = {
    id: "681946187490000803",
    type: 4,
    name: "channelThree",
    position: 0,
    flags: 0,
    parent_id: null,
    guild_id: "681946187490000902",
    Permission_overwrites: []
};

export const discordResponseChannelFour = {
    id: "681946187490000804",
    type: 4,
    name: "channelFour",
    position: 0,
    flags: 0,
    parent_id: "681946187490000802",
    guild_id: "681946187490000902",
    Permission_overwrites: []
};


export const discordResponseChannels1 = [
    {
        id: "915914985140531241",
        name: "┏━┫COMMUNITY┣━━━━┓",
        parent_id: null,
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true
    },
    {
        id: "9304885421682485901",
        name: "🗺・DAOX",
        parent_id: null,
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "915914985140531243",
        name: "🛬arrivals",
        parent_id: "1049502076272660490",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "915915078690295830",
        name: "🎯opportunities",
        parent_id: "967430831129907301",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "915917066496774165",
        name: "👋・introductions",
        parent_id: "928623723190292520",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "915944557605163008",
        name: "💬・general-chat",
        parent_id: "915914985140531241",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "920707473369878589",
        name: "📖・learning-together",
        parent_id: "915914985140531241",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "921468460062605334",
        name: "☝・start-here",
        parent_id: "928623723190292520",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "928327080754692176",
        name: "🔬・research-mentorship",
        parent_id: "967434472402350191",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "928623723190292520",
        name: "┏━┫WELCOME┣━━━━┓",
        parent_id: null,
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "928625049685098586",
        name: "🧠・verification",
        parent_id: "1049502076272660490",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "928627624585072640",
        name: "┏━┫CONTRIBUTE┣━━━┓",
        parent_id: null,
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930047896873762827",
        name: "rules",
        parent_id: "967430831129907301",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930047897473531936",
        name: "moderator-only",
        parent_id: "967434472402350191",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930049272693530674",
        name: "😎・meeting room",
        parent_id: "928627624585072640",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930413119468081192",
        name: "legal",
        parent_id: "967430831129907301",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930488542168248390",
        name: "🗺・official-links",
        parent_id: "928627624585072640",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930488542168248590",
        name: "🗺・DAO",
        parent_id: null,
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    }
]

export const discordResponseChannels2 = [
    {
        id: "915914985140531241",
        name: "┏━┫COMMUNITY┣━━━━┓",
        parent_id: null,
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true
    },
    {
        id: "915914985140531243",
        name: "🛬arrivals",
        parent_id: "1049502076272660490",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "915915078690295830",
        name: "🎯opportunities",
        parent_id: "967430831129907301",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "915917066496774165",
        name: "👋・introductions",
        parent_id: "928623723190292520",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "915944557605163008",
        name: "💬・general-chat",
        parent_id: "915914985140531241",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "920707473369878589",
        name: "📖・learning-together",
        parent_id: "915914985140531241",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "921468460062605334",
        name: "☝・start-here",
        parent_id: "928623723190292520",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "928327080754692176",
        name: "🔬・research-mentorship",
        parent_id: "967434472402350191",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "928623723190292520",
        name: "┏━┫WELCOME┣━━━━┓",
        parent_id: null,
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "928625049685098586",
        name: "🧠・verification",
        parent_id: "1049502076272660490",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "928627624585072640",
        name: "┏━┫CONTRIBUTE┣━━━┓",
        parent_id: null,
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930047896873762827",
        name: "rules",
        parent_id: "967430831129907301",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930047897473531936",
        name: "moderator-only",
        parent_id: "967434472402350191",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930049272693530674",
        name: "😎・meeting room",
        parent_id: "928627624585072640",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930413119468081192",
        name: "legal",
        parent_id: "967430831129907301",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    },
    {
        id: "930488542168248390",
        name: "🗺・official-links",
        parent_id: "928627624585072640",
        guild_id: "915914985140531240",
        canReadMessageHistoryAndViewChannel: true

    }
]

export const channel1: IChannel = {
    channelId: '987654321098765432',
    name: 'Channel 1',
    parentId: null
};

export const channel2: IChannel = {
    channelId: '234567890123456789',
    name: 'Channel 2',
    parentId: '987654321098765432'
};

export const channel3: IChannel = {
    channelId: '345678901234567890',
    name: 'Channel 3',
    parentId: '987654321098765432'
};

export const channel4: IChannel = {
    channelId: '345678901234567000',
    name: 'Channel 4',
    parentId: null
};

export const insertChannels = async function <Type>(channels: Array<Type>, connection: Connection) {
    await connection.models.Channel.insertMany(channels.map((channel) => (channel)));
};