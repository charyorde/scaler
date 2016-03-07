/**
 * Abstract database layer
 */ 
module.exports = function(options) {
    var dbobj = {};
    
    // update
    dbobj.update = function(data, model) {
        return;
    };

    // construct where query clause
    dbobj.where = function(query) {
      return;
    };

    // constructs a query filter
    dbobj.queryfilter = function(query) {
      return;
    };

    dbobj.select = function(params) {
      return;
    };

    dbobj.insert = function(params) {
      return;
    };

    dbobj.update = function(params) {
      return;
    };

    dbobj.delete = function(params) {
      return
    };

    dbobj.query = function(query) {
      return;
    };
    
    dbobj.preparedQuery = function(query) {
      return;
    };

    dbobj.updateListCollection = function(query) {
      return
    };

    dbobj.insertListCollection = function(query) {
      return
    };
  
    return dbobj;  
};
