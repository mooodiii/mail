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
    document.querySelector("#email-view").style.display = "none";

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector("#email-view").style.display = "none";

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
                div.addEventListener("click", () => {
                    load_email(element.id, mailbox)
                });
                div.innerHTML = `<p>${email}</p><p>${element.subject}</p><p>${element.timestamp}</p>`;
                if (element.read === true) {
                    div.style.backgroundColor = 'lightgray';
                }

                document.querySelector("#emails-view").append(div);
            });
        })
}

function load_email(id, mailbox) {
    document.querySelector("#emails-view").style.display = "none";
    document.querySelector("#compose-view").style.display = "none";
    document.querySelector("#email-view").style.display = "block";
    console.log(id);
    fetch(`/emails/${id}`)
        .then(Response => Response.json())
        .then(data => {
            let email = "";
            data["recipients"].forEach((r) => {
                email += `${r}, `;
            });
            email = email.slice(0, email.length - 2);
            document.querySelector(
                "#email-view"
            ).innerHTML = `<p><span>From:</span> ${data.sender}</p>
            <p><span>To:</span> ${email}</p>
            <p><span>Subject:</span> ${data.subject}</p>
            <p><span>Timestamp:</span> ${data.timestamp}</p>
            <div id="reply"></div>
            <hr>
            <p>${data.body}</p>`;
            if (mailbox === "inbox") {
                let button1 = document.createElement('button');
                button1.className = "btn btn-sm btn-outline-primary";
                button1.innerHTML = "Reply";
                button1.addEventListener('click', () => {
                    compose_email();
                    document.querySelector("#compose-recipients").value = data.sender;
                    document.querySelector("#compose-subject").value = `Re: ${data.subject}`;
                    document.querySelector("#compose-body").value = `On ${data.timestamp} ${data.sender} wrote: ${data.body}`;
                })
                document.getElementById('reply').append(button1)
                let button = document.createElement('button');
                button.className = "btn btn-sm btn-outline-primary";
                button.value = "Archive";
                button.innerHTML = "Archive";
                button.addEventListener('click', () => {
                    fetch(`/emails/${id}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                archived: true,
                            })
                        })
                        .then(Response => {
                            return Response;
                        })
                        .then(data => {
                            console.log(data);
                            load_mailbox('inbox')
                        })
                })
                document.querySelector("#email-view").append(button);
            } else if (mailbox === "archive") {
                let button = document.createElement("button");
                button.innerHTML = "Unarchive";
                button.addEventListener("click", () => {
                    fetch(`/emails/${id}`, {
                            method: "PUT",
                            body: JSON.stringify({
                                archived: false,
                            }),
                        })
                        .then((Response) => {
                            return Response;
                        })
                        .then((data) => {
                            console.log(data);
                            load_mailbox("inbox");
                        });
                });
                document.querySelector("#email-view").append(button);
            }

            fetch(`/emails/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    read: true,
                }),
            });
        })
}