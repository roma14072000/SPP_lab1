const fs = require("fs-extra");
const controllerHelpers = require('./controllerHelpers.js');
const notesDB = "notes.json";

function GetNote(noteId) {
	let content = fs.readFileSync(notesDB, "utf8");
	let notes = JSON.parse(content);
	let note = null;

	for (var i = notes.length - 1; i >= 0; i--) {
		if (notes[i].id == noteId) {
			note = notes[i];
			break;
		}
	}

	return note;
}

function GetNotes() {
	let data = "";
	let notes = [];

	try {
		data = fs.readFileSync(notesDB, "utf8");
	} catch(error) {
		console.error(error);	
	}

	try {
		notes = JSON.parse(data);
	} catch(error) {
		console.error(error);
		fs.writeFileSync(notesDB, '[]');
		notes = [];
	}

	return notes;
}

function RewriteNotes(notes) {
	let data = JSON.stringify(notes);
	fs.writeFileSync("notes.json", data);
}

module.exports.filter = function(request, response) {
 	if(!request.body) return response.sendStatus(400);
	let notes = GetNotes();
	let status = request.body.status;
	let filtredNotes = [];

	if (status == 'Все') {
		filtredNotes = notes;
	} else {
		if (status == 'Завершено!') {
			filtredNotes = notes.filter(note => note.complete);
		} else {
			filtredNotes = notes.filter(note => controllerHelpers.getStatus(note.date) == status && !note.complete);
		}
	}

	console.log(status);
	console.log(filtredNotes);

	response.render("MainPage.hbs", 
	{
		tableVisible: filtredNotes.length > 0,
		notes: filtredNotes
	});
}

module.exports.complete = function(request, response) {
	if(!request.body) return response.sendStatus(400);
	let notes = GetNotes();
	let id = request.body.id;

	for (var i = notes.length - 1; i >= 0; i--) {
		if (notes[i].id == id) {
			notes[i].complete = request.body.complete == 'on';
			console.log(notes[i]);
			break;
		}
	}

	RewriteNotes(notes);
	response.redirect("/details?id=" + id);
}

module.exports.save = function(request, response) {
	if(!request.body) return response.sendStatus(400);

	let notes = GetNotes();
	let note = {
		id: request.body.id,
		title: request.body.title,
		content: request.body.content,
		date: request.body.date,
		complete: false
	};

	if (note.id == '0') {
		 
	    let maxId = Math.max.apply(Math, notes.map(function(o) {
	    	return o.id;
	    }));

	    if (maxId == Infinity) {
	    	maxId = 0;
	    }

	    note.id = maxId + 1;
	    notes.push(note);

	    if (!fs.existsSync(__dirname + '/files/' + note.id)) {
	    	fs.mkdir(__dirname + '/files/' + note.id, {recursive: true}, (err) => {
	    		if (err) throw err;
	    	});
	    }	    

	} else {
		for (var i = notes.length - 1; i >= 0; i--) {
			if (notes[i].id == note.id) {
				notes[i].title = note.title;
				notes[i].content = note.content;
				notes[i].date = note.date;
				break;
			}
		}	
	}
	
	RewriteNotes(notes);
	response.redirect("/details?id=" + note.id);
}

module.exports.delete = function(request, response) {
    let id = request.query.id;
    let notes = GetNotes();
    let index = -1;

    for(var i = 0; i < notes.length; i++) {
        if(notes[i].id == id){
            index = i;
            break;
        }
    }

    if(index > -1){
        notes.splice(index, 1)[0];
        RewriteNotes(notes);

        fs.remove(__dirname + '/files/' + id, err => {
        	if (err) return console.error(err);
        });

        response.redirect("/");
    } else {
        response.status(404).send();
    }
}

module.exports.edit = function(request, response) {
	let note = GetNote(request.query.id);

	if (note != null) {
		response.render("EditDetails.hbs", {
			note: note
		});
	} else {
		response.status(404).send();
	}
}

module.exports.new = function(request, response) {
	let note = {
		id: 0,
		title: "",
		content: "",
		date: "",
		complete: false
	};

	response.render("EditDetails.hbs", 
	{
		note: note
	});
}

module.exports.details = function(request, response) {
	let note = GetNote(request.query.id);
	let files = [];

	if (fs.existsSync(__dirname + '/files/' + request.query.id)) {
		files = fs.readdirSync(__dirname + '/files/' + request.query.id);
	}
	 
	console.log(files);

	if (note != null) {
		response.render("details.hbs", 
		{
			note: note,
			files: files,
			showTable: files.length > 0,
			showDate: note.date != ''
		});
	} else {
		response.status(404).send();
	}
}

module.exports.main = function(request, response) {
	let notes = GetNotes();

	response.render("MainPage.hbs", 
	{
		tableVisible: notes.length > 0,
		notes: notes
	});
}