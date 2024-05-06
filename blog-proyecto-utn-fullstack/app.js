//npm init -y
// // // dependencias
// npm i body-parser ejs express express-session mysql

const express = require('express');
const app = express();
const mysql = require('mysql'); // Paquete que vincula el proyecto con mysql
const session = require('express-session'); // Soporte para manejar sesiones de usuario
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const PORT = 3060;


//Configuracion del motor de plantilla
app.set('view engine', 'ejs');

//Especificamos el directorio para el CSS
app.use('/public', express.static('public'));

//Conexion con la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog_project'
});


//Conexion con la base para el manejo de errores y para crear la tabla
connection.connect((error) => {
    if (error) throw error; //Da un mensaje del error

    //Crear una tabla si no existe
    const createTable = `CREATE TABLE IF NOT EXISTS publicaciones(id INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(255), contenido TEXT, fecha DATETIME)`;

    //Realizar la consulta
    connection.query(createTable, (error, resultado) => {
        if (error) throw error;
        console.log('Tabla creada');
    }); // 2 parametros, el primero es ¿Que sera la consulta? '(createTable)', el segundo es una funcion que maneja el error '(error, resultado)'
});


//Middleware 1
app.use(express.json()); //-Todo lo que ingrese como informacion lo interpretara y lo convierte de JSON A OBJETO
//Middleware 2
app.use(bodyParser.urlencoded({ extended: true })); //Lo quee pasa por el body, se vuelve accesible gracias a esta linea
// Middleware 3 para permitir métodos HTTP falsos (como DELETE) en formularios HTML
app.use(methodOverride('_method'));


//Rutas GET----------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.render('page/index.ejs', {posts: ""})
});

app.get('/header', (req, res) => {
    res.render('page/header.ejs')
});

// Rutas
app.get('/index', (req, res) => {
    connection.query('SELECT * FROM publicaciones', function (error, registros) {
        if (error) throw error;

        // Si hay publicaciones, renderizamos la vista index.ejs y pasamos los datos de las publicaciones como contexto
        res.render('page/index.ejs', { posts: registros });
    });

});

//GET mostrar-editar------------------------------------------------------------------
app.get('/mostrar-editar/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM publicaciones WHERE id = ?';

    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
        }
        res.render('page/details', { post: result[0]});
    });
});

app.get('/add-post', (req, res) => {
    res.render('page/add-post.ejs')
});

//Rutas POST
app.post('/add-post', (req, res) => {
    let titulo = req.body.titulo
    let contenido = req.body.contenido
    let fecha = new Date();
    //Inserción de datos en la base
    connection.query('INSERT INTO publicaciones (titulo, contenido, fecha) VALUES (?, ?, ?)', [titulo, contenido, fecha], function (error, resultado) {
        if (error) throw error;
    });
    res.redirect('/index') 
})

// Redirección a la página para editar una publicación
app.get('/edit-post/:id', (req, res) => {
    const id = req.params.id;
    res.render('page/edit-post', { postId: id });
});

// Editar publicación
app.post('/edit-post/:id', (req, res) => {
    const id = req.params.id;
    const titulo = req.body.titulo;
    const contenido = req.body.contenido;

    // Consulta SQL para actualizar los datos del post
    const sql = 'UPDATE publicaciones SET titulo = ?, contenido = ? WHERE id = ?';

    // Ejecutar la consulta SQL con los nuevos valores
    connection.query(sql, [titulo, contenido, id], (err, resultado) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error al actualizar la publicación.');
            return;
        }
        res.redirect('/index'); // Redirecciona a la página principal después de editar el post
});

//DELETE-------------------------------------------------------------
app.delete('/eliminar/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM publicaciones WHERE id = ?';

    connection.query(sql, [id], (err, resultado) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error al eliminar el blog.');
            return;
        }
        res.json({ message: 'Blog eliminado satisfactoriamente.' });
    });
});


app.listen(PORT, () => {
    console.log('Puerto ejecutandose')
})


