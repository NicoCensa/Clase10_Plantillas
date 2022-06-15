const socket = io.connect();

const render = data => {
    const html = data.map((elem, index) => {
        return(`<div>
            <strong style="color:Blue">${elem.author}</strong>:
            <em style="color:Brown">${elem.text}</em>
            <em style="color:Green">${elem.date} ${elem.time}</em></div>`)
    }).join(" ");
    document.getElementById('messages').innerHTML = html;
}

socket.on('messages', function(data) { render(data); });

socket.on('messages', messages =>{
    console.log(messages);
    render(messages);
})

const chat = document.getElementById("chat");
chat.addEventListener('submit', event =>{
    event.preventDefault();
    addMessage();
});

function addMessage() {
    const dateString = new Date().toLocaleDateString()
    const timeString = new Date().toLocaleTimeString()
    const message = {
        author: document.getElementById('mail').value,
        text: document.getElementById('texto').value,
        date: dateString,
        time: timeString
    };
    console.log(message);
    socket.emit('new-message', message);
    return false;
}

const btn = document.getElementById("load")
btn.addEventListener("click",(ev)=>{
    ev.preventDefault();
    const id = document.getElementById('id').value;
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const thumbnail = document.getElementById('thumbnail').value;

    socket.emit('add',{id,title,price,thumbnail})

    socket.on('show', data =>{
        fetch('/api/productos/tabla')
            .then(r => r.text())
            .then(html=> {
                console.log(html);
                const listProd = document.getElementById("listaProductos");
                listProd.innerHTML = html
            })
            .catch(e => alert(e))
    
    })
} )
