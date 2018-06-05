const request = require('request-promise');

const Applications = [
    {
        name: "Split API",
        url: "https://split.braspag.com.br/api/healthcheck"
    },
    {
        name: "Split Grid",
        url: "https://split.braspag.com.br/grid-api/healthcheck"
    }
]

const getHealthCheckStatus = () => {
    const applicationResults = [];
    const allPromises = [];

    Applications.forEach(element => {
        var promise = request({ uri: element.url, json: true }).then((result) => {
            return { name: element.name, result };
        }).catch((err) => {
            return { name: element.name, IsHealthly: false, Error: err };
        });
        allPromises.push(promise);
    });

    return Promise.all(allPromises)
}

module.exports = {
    getHealthCheckStatus: getHealthCheckStatus
}