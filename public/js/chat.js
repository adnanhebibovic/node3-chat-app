const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.querySelector('input')
const $messageButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#location-button')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

const { username } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const socket = io({
    auth: {
      user: username
    }
  })

socket.emit('welcome', (status) => {
    console.log(status)
})

socket.on('welcome', (users) => {
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        users: users
    })
    $sidebar.innerHTML = html
})

socket.on('goodbye', (users) => {
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        users: users
    })
    $sidebar.innerHTML = html
})

const autoscroll = () => {
    $messages.scrollTop = $messages.scrollHeight
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        text: message.text,
        created: moment(message.created).format('LTS')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('location', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.text,
        created: moment(location.created).format('LTS')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message

    socket.emit('message', message.value, (status) => {
        $messageButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()

        console.log('Status ' + status)
    })
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('location', { 
            latitude: position.coords.latitude,  
            longitude: position.coords.longitude,
            username: username
        }, (status) => {
            $locationButton.removeAttribute('disabled')
            console.log('Status ' + status)
        })
    })
})