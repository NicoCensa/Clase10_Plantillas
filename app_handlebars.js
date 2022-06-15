const express = require('express');
const {engine} = require('express-handlebars');
const res = require('express/lib/response');
const http = require('http');
const { Server } = require('socket.io');
const {Router} = express;
const fs = require('fs');
const { json } = require('stream/consumers');


const app = express();
const router = Router();
const server = http.createServer(app); //Pasamanos de express api a http api
const io = new Server(server);


class Contenedor{
    fileSystem;
      constructor(nombreArchivo, fs){
          this.fileSystem = fs;
          this.nombreArchivo = `./${nombreArchivo}`;
          this.fileSystem.writeFileSync(nombreArchivo,`{"listaMensajes": []}`);
      }    
      save(mensaje){
        try {
          const data = JSON.parse(this.fileSystem.readFileSync(this.nombreArchivo, `utf-8`));
            data.listaMensajes.push(mensaje);
            this.fileSystem.writeFileSync(this.nombreArchivo, JSON.stringify(data))
        } catch (err) {
          console.log(err)
        }
      }
  
      deleteAll(){
        this.fileSystem.writeFileSync(this.nombreArchivo,`{"listaMensajes": []}`);
      }
      
  }

const archivo = new Contenedor("mensajes.txt", fs);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/productos', router);
app.use('/public', express.static(__dirname + '/public'));

const data = [
    {id:1, title:'Alicate', price:1100,thumbnail:"https://i.postimg.cc/CKxxNb8v/alicate.jpg"},
    {id:2, title:'Correa',price:800,thumbnail:"https://i.postimg.cc/4Nv4RWbL/correa.jpg"},
    {id:3, title:'Bandeja de Cesped',price:3300,thumbnail:"https://i.postimg.cc/MG3KrXbz/bandeja-Cesped.jpg"}
]

const messages = [
    {author: 'Bot', text: 'Bienvenidos!, Comiencen el chat!', date:'15/6/2022', time:'17:12:06'}
]

io.on('connection', socket => {
    console.log(new Date().toLocaleTimeString(), `User connected, id: ${socket.id}`);
    socket.emit('messages', messages);

    socket.on("new-message", (newMessage)=>{
        messages.push(newMessage);
        archivo.save(newMessage);
        io.sockets.emit('messages', messages);
    })

    socket.on("add", producto=>{
        data.push(producto);
        io.sockets.emit('show', 'new data');
    })
})

server.listen(8080, () =>{
    console.log('Server running...')
})
server.on('error', e=>{
    console.log('Error on server', e)
})

app.set('views','./views')
app.set('view engine', 'hbs')

app.get('/', (req,res) =>{
        res.render("main");
})

router.get('/tabla',(req,res) =>{
    if(data.length > 0){
        res.render('table',{
            products: data,
            listExists:true
        })
    }else{
        res.render('table',{
            products: data,
            listExists:false
        })
    }
})

router.get('/', (req,res) =>{
    if(data.length > 0){
        res.render('products',{
            products: data,
            listExists:true
        })
    }else{
        res.render('products',{
            products: data,
            listExists:false
        })
    }
})

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs'
}))


server.on('error', e=>{
    console.log('Error on server', e)
})

router.post('/', (req,res) =>{
    console.log(req.body)
    data.push(req.body);
    res.json(req.body);
})

router.get('/:id', (req,res)=>{
    const id = Number(req.params.id);
    if(isNaN(id)){
        res.status(400)
        res.json({error:'Producto no encontrado'})
        return
    }

    if(id > data.length || id <= 0){
        res.status(400)
        res.json({error:'Producto no encontrado'})
        return
    }
    res.json(data.find(d=>d.id == id))
})