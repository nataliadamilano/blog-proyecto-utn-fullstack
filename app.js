const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');

//Definimos el motor de plantilla
app.set("view engine", "ejs");


//Configuracion de los archivos estaticos 
app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

//Conexion con la base
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog_project'
});

//Creación de la tabla 
connection.connect((error) => {

    //Manejar el error
    if (error) throw error;
    console.log('Conexión exitosa');


    //creamos la estructura
    const createTable = `CREATE TABLE IF NOT EXISTS publicaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        contenido TEXT(100) NOT NULL, 
        fecha DATETIME NOT NULL
    )`;

    connection.query(createTable, (error, resultado) => {
        if (error) throw error;
        console.log('Tabla creada o ya existente');
    });

});

// Rutas
app.get('/', (req, res) => {
    connection.query('SELECT * FROM publicaciones', function (error, registros) {
        if (error) throw error;

        // Si hay publicaciones, renderizamos la vista index.ejs y pasamos los datos de las publicaciones como contexto
        res.render('page/index', { posts: registros });
    });
    
});

app.get('/add-post', (req, res) => {
    res.render('page/add_post')
})

app.post('/add-post', (req, res) => {
    let titulo = req.body.titulo
    let contenido = req.body.contenido
    let fecha = new Date();
    //Inserción de datos en la base
    connection.query('INSERT INTO publicaciones (titulo, contenido, fecha) VALUES (?, ?, ?)', [titulo, contenido, fecha], function (error, resultado) {
        if (error) throw error;
    });
    
    res.redirect('/') 
})

app.get('/edit-post', (req, res) => {
    res.render('page/edit_post')
})

app.get('/delete-post', (req, res) => {
    res.render('page/delete_post')
})


// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});