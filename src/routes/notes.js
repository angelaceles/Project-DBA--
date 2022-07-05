const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../helpers/auth');

const pool = require('../database');


router.get('/notes/add', isAuthenticated, (req, res)=>{
    res.render('notes/new-note');
});

router.post('/notes/new-note', isAuthenticated, async (req, res)=>{
    const {curso, titulo, descripcion} = req.body;
    const errors = [];
    if(!curso){
        errors.push({text: 'Please write a lesson'});
    }
    if(!titulo){
        errors.push({text: 'Please write a title'})
    }
    if(!descripcion){
        errors.push({text: 'Please write a description'})
    }
    if(errors.length > 0){
        res.render('notes/new-note', {
            errors,
            curso,
            titulo,
            descripcion
        })
    }else{
        user_id = req.user.id;
        let procedure = `CALL insert_datos(?, ?, ?, ?)`;
        await pool.query(procedure, [curso, titulo, descripcion, user_id]);
        req.flash('success_msg', 'Note added successfully');
        res.redirect('/notes');
    }
});

router.get('/notes', isAuthenticated, async (req, res)=>{
    let procedure = `CALL show_datos(?)`;
    let user_id = req.user.id;
    const notes = await pool.query(procedure, [user_id]);
    const RowDataPacket = notes[0];
    res.render('notes/all-notes', {RowDataPacket});
});

router.get('/notes/table', isAuthenticated, async (req, res)=>{
    let user_id = req.user.id;
    let procedure = `CALL show_all_datos(?)`;
    const notes = await pool.query(procedure, [user_id]);
    res.render('notes/table-note', {notes: notes[0]});
});


router.get('/notes/show-note/:id', isAuthenticated, async (req, res)=>{
    let procedure = `CALL find_by_id(?)`;
    let {id} = req.params;
    const note = await pool.query(procedure, [id]);
    const RowDataPacket = note[0];
    res.render('notes/show-note', {RowDataPacket: RowDataPacket[0]});
    console.log(RowDataPacket[0])
});

router.get('/notes/dashboard', isAuthenticated, async (req, res)=>{
    let user_id = req.user.id;
    let get_id_user = `CALL show_user(?)`;
    let contarCompletas = `CALL c_notas_cumplidas(?)`;
    let contarIncompletas = `CALL c_notas_incumplidas(?)`;
    let contarPorDia = `CALL c_notas_dia(?)`;
    const user = await pool.query(get_id_user, [user_id]);
    const notas_c = await pool.query(contarCompletas, [user_id]);
    const notas_i = await pool.query(contarIncompletas, [user_id]);
    const notas_d = await pool.query(contarPorDia, [user_id]);
    const proce_result = {...user[0][0],...notas_c[0][0], ...notas_i[0][0], ...notas_d[0][0]};
    res.render('notes/dashboard', {proce_result});
});


router.get('/notes/edit/:id', isAuthenticated, async (req, res)=>{
    let procedure = `CALL find_by_id(?)`;
    let note_id = req.params.id;
    const note = await pool.query(procedure, [note_id]);
    const RowDataPacket = note[0];
    res.render('notes/edit-note', {RowDataPacket: RowDataPacket[0]});
});

router.put('/notes/edit-note/:id', isAuthenticated, async (req, res)=>{
    const {id} = req.params;
    const {curso, titulo, descripcion} = req.body;
    let procedure = `CALL update_datos(?,?,?,?)`;
    await pool.query(procedure, [curso, titulo, descripcion, id]);
    req.flash('success_msg', 'Note updated successfully');
    res.redirect('/notes');
});

router.put('/notes/remove/:id', isAuthenticated, async (req, res) => {
    let procedure = "CALL quitar_datos(?)";
    const {id} = req.params;
    await pool.query(procedure, [id]);
    req.flash('success_msg', 'note removed successfully');
    res.redirect('/notes');
});

router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    const {id} = req.params;
    let procedure = "CALL eliminar_dato(?)";
    await pool.query(procedure, [id]);
    req.flash('success_msg', 'note deleted successfully');
    res.redirect('/notes/table');
});

module.exports = router;