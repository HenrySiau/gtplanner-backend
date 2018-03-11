const env = process.env;

module.exports = {
    nodeEnv: env.NODE_ENV || 'development',
    logStars: function (message) {
        console.info('**********');
        console.info(message);
        console.info('**********');
    },
    port: env.PORT || 8080,
    host: env.HOST || '0.0.0.0',
    get serverUrl() {
        return `http://${this.host}:${this.port}`;
    },
    superSecret: 'asdfnkko238klh&@ssd',
    // JWT valid for how many milliseconds
    // here we set it for 90 days
    JWTDurationMS: 1000*60*60*24*90
};