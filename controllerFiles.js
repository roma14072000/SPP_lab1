const fs = require("fs-extra");

module.exports.deleteFile = function(request, response) {
	if(!request.body) return response.sendStatus(400);
	let file = __dirname + '/files/' + request.body.fileName;
	console.log(file);
	if (fs.existsSync(file)) {
		fs.remove(file, err => {
			if (err) return console.error(err);
			console.log("deleted" + file);
		});
	}

	response.redirect('back');
}

module.exports.downloadFile = function(request, response) {
	if(!request.body) return response.sendStatus(400);
	let file = __dirname + '/files/' + request.body.fileName;

	if (fs.existsSync(file)) {
		console.log("download" + file);
		response.download(file);
	}
}

module.exports.uploadFile = function(request, response) {
	 console.log(request.file);

	if (!fs.existsSync(__dirname + '/files/' + request.body.id)) {
		fs.mkdirSync(__dirname + '/files/' + request.body.id, {recursive: true});
    }

	fs.rename(request.file.path, __dirname + '/files/' + request.body.id + '/' + request.file.originalname, function(err) {
		if (err) throw err;

		if (fs.existsSync(request.file.path)) {
			fs.remove(request.file.path, err => {
				if (err) return console.error(err);
		});
		}
	});

	response.redirect('back');
}