const express =  require('express'); // se importa el modulo de express
const mysql = require('mysql2'); // se improta el modulo de mysql
const bodyParser = require('body-parser'); // se importa el modulo bodyParser que sirve para analizr el cuero de las solicitudes entrantes
const path = require('path');
const app = express(); // e inicializa una instancia de express esto lo usaremos para definir rutas, configurar middleware en el servidor web


app.use(bodyParser.urlencoded({ extended: true})); // Esto habilita el analisis de datos de solicitudes de tipo POST en formularios
app.use(express.static('public')); // Esto habilita el uso de los archivos que se encuentren en la carpeta public
app.set('view engine', 'ejs'); // aca le estamos indicando el tipo de arvhico que ocuparemos Embedded JavaScript
app.set('views', path.join(__dirname, 'views', 'pages')); // aca se setea la ruta donde estaran los arvhivo de vista que ocuparemos con EJS

// Configuramos la conexion con la BD

const db = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'admin',
    database:'agendaEniac'
});

// aca se maneja la conexion y el error de conexion con una excepcion  es throw

db.connect(err =>{
    if(err) throw err;
    console.log('La conexion con la BD fue Exitosa')
  
})

// Definimos el puerto en el que se va a iniciar el servidor Web

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor Web iniciado en http://localhost:${PORT}/`);
})

// Ruta Pagina Principal

app.get('/', (req, res) =>{
    res.render('pagPrincipal', { titulo: "Pagina Principal" });
   
})

// Ruta Agenda

app.get('/agenda', (req, res) => {
    res.render('agenda', {titulo: "Agenda"});
});

//Ruta para agregar un contacto
app.post('/agregar',(req, res) =>{
    const { nombres, apellidos, correo, telefono, fecha_nacimiento, linkedin, parentesco} = req.body;
    const query = 'INSERT INTO contactos (nombres, apellidos, correo, telefono, fecha_nacimiento, linkedin, parentesco) VALUES (?, ?, ?, ?, ?, ?, ?)'
    db.query(query, [nombres, apellidos, correo, telefono || null, fecha_nacimiento, linkedin || null, parentesco], (err, result) =>{
        if(err) throw err;
        res.redirect('/agenda')
    })
})

// Ruta para ver los contactos

app.get('/contactos', (req, res) => {
    const query = 'SELECT * FROM contactos';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.render('contactos', { contactos: results, titulo: "Contactos" });
    });
});


// Ruta para mostrar el detalle de un contacto
app.get('/contacto/:id', (req, res) => {
    const queryContacto = 'SELECT * FROM contactos WHERE id = ?';
    const queryRelaciones = 'SELECT r.*, c.nombres AS relacionado_nombres, c.apellidos AS relacionado_apellidos FROM relaciones r JOIN contactos c ON r.relacionado_id = c.id WHERE r.contacto_id = ?';

    db.query(queryContacto, [req.params.id], (err, resultContacto) => {
        if (err) throw err;

        db.query(queryRelaciones, [req.params.id], (err, resultRelaciones) => {
            if (err) throw err;

            res.render('detalleContacto', { contacto: resultContacto[0], relaciones: resultRelaciones, titulo: "Contacto" });
        });
    });
});

//Middleware para eliminar un contacto
app.post('/eliminar/:id', (req, res) => {
    const queryRelaciones = 'DELETE FROM relaciones WHERE contacto_id = ? OR relacionado_id = ?';
    const queryContacto = 'DELETE FROM contactos WHERE id = ?';

    db.query(queryRelaciones, [req.params.id, req.params.id], (err, result) => {
        if (err) throw err;

        db.query(queryContacto, [req.params.id], (err, result) => {
            if (err) throw err;
            res.redirect('/contactos');
        });
    });
});

// Ruta para mostrar el formulario de edición de un contacto
app.get('/editar/:id', (req, res) => {
    const queryContacto = 'SELECT * FROM contactos WHERE id = ?';
    const queryTodosContactos = 'SELECT * FROM contactos';
    const queryRelaciones = 'SELECT * FROM relaciones WHERE contacto_id = ?';

    db.query(queryContacto, [req.params.id], (err, resultContacto) => {
        if (err) throw err;

        db.query(queryTodosContactos, (err, resultTodosContactos) => {
            if (err) throw err;

            db.query(queryRelaciones, [req.params.id], (err, resultRelaciones) => {
                if (err) throw err;

                res.render('editarContacto', { titulo: "Editar Contacto",
                    contacto: resultContacto[0], 
                    todosContactos: resultTodosContactos, 
                    relaciones: resultRelaciones 
                });
            });
        });
    });
});

// Ruta para editar un contacto
app.post('/editar/:id', (req, res) => {
    const { nombres, apellidos, correo, telefono, fecha_nacimiento, linkedin, parentesco} = req.body;
    const query = 'UPDATE contactos SET nombres = ?, apellidos = ?, correo = ?, telefono = ?, fecha_nacimiento = ?, linkedin = ?, parentesco = ? WHERE id = ?';
    db.query(query,  [nombres, apellidos, correo, telefono || null, fecha_nacimiento, linkedin || null, parentesco, req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/contacto/' + req.params.id);
    });
});

// Ruta para agregar una relación
app.post('/agregarRelacion/:id', (req, res) => {
    const { relacionado_id, tipo_relacion } = req.body;
    const query = 'INSERT INTO relaciones (contacto_id, relacionado_id, tipo_relacion) VALUES (?, ?, ?)';
    db.query(query, [req.params.id, relacionado_id, tipo_relacion], (err, result) => {
        if (err) throw err;
        res.redirect('/contacto/' + req.params.id);
    });
});

// Ruta para editar una relación
app.post('/editarRelacion/:id', (req, res) => {
    const { tipo_relacion } = req.body;
    const query = 'UPDATE relaciones SET tipo_relacion = ? WHERE id = ?';
    db.query(query, [tipo_relacion, req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/contacto/' + req.body.contacto_id);
    });
});
// Ruta para eliminar una relación
app.post('/eliminarRelacion/:id', (req, res) => {
    const query = 'DELETE FROM relaciones WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/contacto/' + req.body.contacto_id);
    });
});
