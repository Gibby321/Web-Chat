var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// Chargement de la page étudient
app.get('/ConsoleEtudiant', function (req, res) {
  res.sendfile(__dirname + '/ConsoleEtudiant.html');
});

// Chargement de la page étudient
app.get('/login', function (req, res) {
  res.sendfile(__dirname + '/login.html');
});

// chatgement de la page prof
app.get('/ConsoleProfesseur', function (req, res) {
  res.sendfile(__dirname + '/ConsoleProfesseur.html');
});

io.sockets.on('connection', function (socket) {

	socket.on('login', function(user, pass) {
		var mysql = require('mysql');

		var con = mysql.createConnection({
		  host: "localhost",
		  user: "root",
		  password: "",
		  database: "logger"
		});
		
		con.connect(function(err) {
		if (err) throw err;
		con.query("SELECT * FROM `userlogin` WHERE userlogin.Username = '"+user+"' and userlogin.Pass = '"+pass+"'", function (err, result, fields) {
			if (err) throw err;
			if(!result[0]){socket.emit('login_fail'); return false;}
			if(user == result[0].Username && pass == result[0].Pass){
				var destination = '/ConsoleProfesseur';
				socket.emit('redirect', "/ConsoleProfesseur", result[0].Username);
			}else{
				socket.emit('login_fail');
			}
		  });
		});
		
    });

    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
    });
	
	 // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('Connect_Prof', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('Connect_Prof', pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('nouveau_message', function (message) {
        message = ent.encode(message);
		console.log(socket.pseudo+": "+message);
        socket.broadcast.emit('nouveau_message', {pseudo: socket.pseudo, message: message});
    }); 
	
	socket.on('reconnect', function (pseudo) {
		console.log("reconnect: " + pseudo);
		pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('reconnect', pseudo);
    }); 
});

server.listen(8080);
