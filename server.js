const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const colors = require('@colors/colors');
const cors = require('cors');
const app = express();
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


//DATABASE CONNECTION
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydatabase'
});
db.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack .red);
        return;
    }
    console.log('connected to database' .green);
});



app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/api', (req, res) => {
    res.status(200).send({
        message: 'success',
        status: 200,
        success: true
    });
});
//Insert API
app.post('/api/users', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;  
    if(!name || !email) {
        return res.status(400).send({   
            status: 400,
            success: false,
            message: 'Please provide name and email'
        });
    }
    const checkquery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkquery, [email], (err, result) => {
        if (err) {
            console.log(err .brightRed);
        } else {
            if(result.length > 0) {
                return res.status(409).send({
                    status: 409,
                    success: false,
                    message: 'User already exists'  
                });
            }
        }
        db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, result) => {
            if (err) {
               
                console.log(err .brightRed);
            } else {
                res.status(201).send({
                    status: 200,
                    success: true,
                    message: 'User added successfully',
                    data: result
                });
            }
        });
    });
    
});
//Get API
app.get('/api/users', (req, res) => {
    
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send({
                status: 200,
                success: true,
                message: 'Users fetched successfully',
                data: result
            });
        }
    });
    
});
//Update API
app.put('/api/users/:id', (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    const checkquery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkquery, [email], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            if(result.length > 0) {
                return res.status(409).send({
                    status: 409,
                    success: false,
                    message: 'User already exists'  
                });
            }
        }
        db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send({
                    status: 200,
                    success: true,
                    message: 'User updated successfully',
                    data: result
                });
            }
        });
    });
    
});

//Delete API
app.delete('/api/users/:id', (req, res) => {    
    const id = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => { 
        if (err) {  
            console.log(err);   
        } else {
            res.send({
                status: 200,
                success: true,
                message: 'User deleted successfully',
                data: result    
            });
        }
    });
});
//Search API
app.get('/api/users/:name', (req, res) => {
    const {name,email} = req.params;
    let query = 'SELECT * FROM users WHERE 1=1';
    let queryParems = [];
    if (name) {
        query += ' AND name LIKE ?';
        queryParems.push(`%${name}%`);
    }
    if (email) {
        query += ' AND email LIKE ?';
        queryParems.push(`%${email}%`);
    }
    db.query(query, queryParems, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200).send({
                status: 200,
                success: true,
                message: 'Users fetched successfully',
                data: result
            })
        }
    
});
});
//Pagination API
app.post('/api/users/pagination', (req, res) => {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    console.log(page,limit);
    const offset = (page - 1) * limit;
   
    db.query('SELECT * FROM users LIMIT ? OFFSET ?', [limit, offset], (err, result) => {
        if (err) {
            console.log(err);
        }else{
            res.status(200).json({
                status: 200,
                success: true,
                message: 'Users fetched successfully',
                data: result
            });
           }
        
    });
});
const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}` .green);
})