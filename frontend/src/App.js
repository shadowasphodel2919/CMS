import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('https://cms-wf0i.onrender.com/api/contacts');
      setContacts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddContact = async (newContact) => {
    const contactWithId = { ...newContact, id: uuidv4() };
    try {
      const response = await axios.post('https://cms-wf0i.onrender.com/api/contacts', contactWithId);
      setContacts([...contacts, response.data]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateContact = async (updatedContact) => {
    try {
      const response = await axios.put(`https://cms-wf0i.onrender.com/api/contacts/${updatedContact.id}`, updatedContact);
      setContacts(contacts.map((contact) => (contact.id === updatedContact.id ? response.data : contact)));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await axios.delete(`https://cms-wf0i.onrender.com/api/contacts/${id}`);
      setContacts(contacts.filter((contact) => contact.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);

    const sortedContacts = [...filteredContacts].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (newSortOrder === 'asc') {
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
      } else {
        if (nameA > nameB) return -1;
        if (nameA < nameB) return 1;
      }

      return 0;
    });

    setContacts(sortedContacts);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Router>
      <Container>
        <h1>
          <a href="https://cms-iota-navy.vercel.app/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Contact Management App
          </a>
        </h1>

        <Form>
          <Form.Group controlId="formSearch">
            <Form.Control
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={handleSearch}
            />
          </Form.Group>
        </Form>

        <Routes>
          <Route
            path="/"
            element={
              <ContactList
                contacts={filteredContacts}
                onDelete={handleDeleteContact}
                onSort={handleSort}
                sortOrder={sortOrder}
              />
            }
          />
          <Route
            path="/add"
            element={<AddContactForm onSubmit={handleAddContact} />}
          />
          <Route
            path="/edit/:id"
            element={<EditContactForm onUpdate={handleUpdateContact} />}
          />
        </Routes>

        <Link to="/add">
          <Button variant="success">Add Contact</Button>
        </Link>
      </Container>
    </Router>
  );
};

const ContactList = ({ contacts, onDelete, onSort, sortOrder }) => (
  <Row>
    <Col>
      <h2>Contacts</h2>
      <Button variant="secondary" onClick={onSort}>
        Sort by Name {sortOrder === 'asc' ? '↑' : '↓'}
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>{contact.phoneNumber}</td>
              <td>{contact.email}</td>
              <td>
                <Link to={`/edit/${contact.id}`}>
                  <Button variant="primary">Edit</Button>
                </Link>
                <Button variant="danger" onClick={() => onDelete(contact.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Col>
  </Row>
);

const AddContactForm = ({ onSubmit }) => {
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '', email: '' });

  const handleInputChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newContact);
    setNewContact({ name: '', phoneNumber: '', email: '' });
  };

  return (
    <Row>
      <Col>
        <h2>Add Contact</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={newContact.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formPhoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={newContact.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={newContact.email}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Add
          </Button>
        </Form>
      </Col>
    </Row>
  );
};

const EditContactForm = ({ onUpdate }) => {
  const [contact, setContact] = useState({ name: '', phoneNumber: '', email: '' });
  const { id } = useParams();

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const response = await axios.get(`https://cms-wf0i.onrender.com/api/contacts/${id}`);
      setContact(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(contact);
  };

  return (
    <Row>
      <Col>
        <h2>Edit Contact</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={contact.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formPhoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={contact.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={contact.email}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Update
          </Button>
        </Form>
      </Col>
    </Row>
  );
};

export default App;
