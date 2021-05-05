const express = require("express");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const fs = require("fs-extra");
const multer = require('multer');

const controllerFiles = require('./controllerFiles.js');
const controllerNotes = require('./controllerNotes.js');
const controllerHelpers = require('./controllerHelpers.js');

const app = express();
const urlParser = bodyParser.urlencoded({extended: false});
const upload = multer({ dest: __dirname + '/files/temp'});

app.use(express.static(__dirname + '/public'));
app.set("view engine", "hbs");

hbs.registerPartials(__dirname + '/views/partials')
hbs.registerHelper("completionStatus", controllerHelpers.getStatus);
hbs.registerHelper("printDate", controllerHelpers.formatDate);

app.post('/deleteFile', urlParser, controllerFiles.deleteFile);
app.post('/downloadFile', urlParser, controllerFiles.downloadFile);
app.post('/uploadFile', upload.single('myFile'), controllerFiles.uploadFile);

app.post("/filter", urlParser, controllerNotes.filter);
app.post("/complete", urlParser, controllerNotes.complete);
app.post("/save", urlParser, controllerNotes.save);
app.post("/new", urlParser, controllerNotes.new);

app.get("/delete", controllerNotes.delete);
app.get("/edit", controllerNotes.edit);
app.get("/details", controllerNotes.details);
app.get("/", controllerNotes.main);

app.listen(3000);

/*
Лабораторная №1
	Разработать простое приложения с рендерингом на сервере. Например, список задач со статусом их выполнения, 
	фильтрацией по статусу и выставлением ожидаемой даты завершения, а так же возможностью прикреплять файлы к каждой задаче. 
	Сервер должен отдавать клиенту готовую разметку, отправка данных серверу должна осуществляться через отправку форм. 
	Обязательно использование NodeJS, конкретные библиотеки могут отличаться. Например, подойдут Express + EJS.
*/
