const mongoose = require('mongoose');

function paginatedResults(model, req){
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page-1)*limit;
    const endIndex = page*limit;
    results = {};
    results.next = {
    page: page+1,
    limit: limit,
    check: false
    };
    if(endIndex < users.length){
    results.next.check = true;
    }
    results.previous = {
    page: page-1,
    limit: limit,
    check: false
    };
    if(startIndex > 0){
    results.previous.check = true;
}
    results.results = users.slice(startIndex, endIndex);
    return results;
}

module.exports = paginatedResults;

