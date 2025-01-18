const axios = require('axios');

const EUREKA_SERVER = process.env.EUREKA_SERVER || 'http://localhost:8761/eureka/';
const SERVICE_NAME = process.env.SERVICE_NAME || 'file-service';
const SERVICE_PORT = process.env.SERVICE_PORT || 5000;
const SERVICE_HOSTNAME = process.env.SERVICE_HOSTNAME || 'localhost';

// Định nghĩa thông tin service
const instance = {
    instance: {
        instanceId: `${SERVICE_NAME}:${SERVICE_HOSTNAME}:${SERVICE_PORT}`,
        hostName: SERVICE_HOSTNAME,
        app: SERVICE_NAME.toUpperCase(),
        ipAddr: '127.0.0.1',
        status: 'UP',
        port: { '$': SERVICE_PORT, '@enabled': true },
        vipAddress: SERVICE_NAME,
        secureVipAddress: SERVICE_NAME,
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn'
        }
    }
};

// Hàm đăng ký service với Eureka
async function registerWithEureka() {
    try {
        console.log(`[Eureka] Registering ${SERVICE_NAME} to Eureka Server...`);

        await axios.post(`${EUREKA_SERVER}apps/${SERVICE_NAME}`, instance, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(`[Eureka] Service ${SERVICE_NAME} registered successfully!`);

        // Gửi heartbeat để giữ service sống trong Eureka
        setInterval(async () => {
            try {
                await axios.put(`${EUREKA_SERVER}apps/${SERVICE_NAME}/${instance.instance.instanceId}`);
                console.log(`[Eureka] Sent heartbeat for ${SERVICE_NAME}`);
            } catch (error) {
                console.error(`[Eureka] Heartbeat failed:`, error.message);
            }
        }, 30000);  // 30 giây

    } catch (error) {
        console.error(`[Eureka] Registration failed:`, error.message);
    }
}

module.exports = { registerWithEureka };
