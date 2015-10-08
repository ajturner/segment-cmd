function error(error) {
	if(error !== undefined && error !== null) console.log("Error: ", error);
	if(error.stack !== undefined) console.log("Error Stack:", error.stack);
};


/**
 * Exports
 */
module.exports = exports = error;
exports.error = error;