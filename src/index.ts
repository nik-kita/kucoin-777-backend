import Redis from 'ioredis';
import Ws from 'ws';

async function main() {
    const pub = new Redis({ db: 7 });
    const sub = pub.duplicate();

    await sub.subscribe('to:client');

    const wsServer = new Ws.Server({ port: 7777 })
        .on('connection', (wsClient) => {
            pub.publish('from:client', 'connected');

            sub.on('message', (channel, dataFromRedis) => {
                
                if (channel !== 'to:client') return;

                const messageFromRedis = JSON.stringify(dataFromRedis);
                
                wsClient.send(messageFromRedis);
            });

            wsClient.on('message', (data: string) => {
                const { channel, message } = JSON.parse(data);

                pub.publish(channel, JSON.stringify(message));
            });
        });
}

main();
