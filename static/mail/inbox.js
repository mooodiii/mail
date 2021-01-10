document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
    document.getElementById('compose-form').onsubmit = () => {
        fetch('/emails', {
                method: 'POST',
                body: JSON.stringify({
                    recipients: document.getElementById('compose-recipients').value,
                    subject: document.getElementById('compose-subject').value,
                    body: document.getElementById('compose-body').value
                })
            })
            .then(Response => {
                return Response.json();
            })
            .then(data => {
                console.log(data);
                load_mailbox('sent');
            })
    }
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    fetch(`/emails/${mailbox}`)
        .then(Response => {
            return Response.json();
        })
        .then(data => {
            data.forEach(element => {
                let email = ""
                if (mailbox === 'sent') {
                    element['recipients'].forEach(r => {
                        email += `${r}, `;
                    })
                    email = email.slice(0, (email.length - 2))
                } else {
                    email = element.sender
                }
                let div = document.createElement('div');
                div.className = 'email';
                div.innerHTML = `<p>${email}</p><p>${element.subject}</p><p>${element.timestamp}</p>`;
                document.querySelector("#emails-view").append(div);
            });
        })
}