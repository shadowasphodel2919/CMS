const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const contactsData = require('./contacts.json');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get('/api/contacts', (req, res) => {
    res.json(contactsData);
});

app.get('/api/contacts/:id', (req, res) => {
    const contactId = req.params.id;
    const contact = contactsData.find((contact) => contact.id === contactId);
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ error: 'Contact not found' });
    }
});

app.post('/api/contacts', (req, res) => {
    const newContact = req.body;
    console.log(newContact);
    contactsData.push(newContact);
    fs.writeFile('./contacts.json', JSON.stringify(contactsData), (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to create contact' });
      } else {
        res.json(newContact);
      }
    });
});

app.put('/api/contacts/:id', (req, res) => {
    const contactId = req.params.id;
    const updatedContact = req.body;
    const index = contactsData.findIndex((contact) => contact.id === contactId);
    if (index !== -1) {
      contactsData[index] = { ...contactsData[index], ...updatedContact };
      fs.writeFile('./contacts.json', JSON.stringify(contactsData), (err) => {
        if (err) {
          res.status(500).json({ error: 'Failed to update contact' });
        } else {
          res.json(contactsData[index]);
        }
      });
    } else {
      res.status(404).json({ error: 'Contact not found' });
    }
});

app.delete('/api/contacts/:id', (req, res) => {
    const contactId = req.params.id;
    console.log(contactId);
    const index = contactsData.findIndex((contact) => contact.id === contactId);
    if (index !== -1) {
      const deletedContact = contactsData.splice(index, 1)[0];
      fs.writeFile('./contacts.json', JSON.stringify(contactsData), (err) => {
        if (err) {
          res.status(500).json({ error: 'Failed to delete contact' });
        } else {
          res.json(deletedContact);
        }
      });
    } else {
      res.status(404).json({ error: 'Contact not found' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
