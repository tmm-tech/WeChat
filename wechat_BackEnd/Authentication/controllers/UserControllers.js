const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validateCreateUserSchema = require('../services/RegistrationValidation')
const { config } = require('../config/sqlConfig');
const { createToken, verifyToken } = require('../services/jwtServices')
const pool = new sql.ConnectionPool(config);
module.exports = {
    createUser: async(req, res) => {
        const details = req.body;
        console.log(details)
        try {
            // validate the content 
            let value = await validateCreateUserSchema(details)
            console.log('Registration')
                // bcrypt asynchronous
            let hashed_pwd = await bcrypt.hash(value.password, 8)

            await pool.connect();
            let results = await pool.request()
                .input("fullname", value.fullname)
                .input("email", value.email)
                .input("profile", value.profile)
                .input("password", hashed_pwd)
                .input("gender", value.gender)
                .input("department", value.department)
                .input("roles", value.roles)
                .input("status", "active")
                .execute('add_User')
            console.log(results.recordset[0]);
            res.json({ success: true, message: 'Registration successful' })

        } catch (error) {
            res.status(500).json({ success: false, message: `Error registering user ${error}` })
        }
    },
    loginUser: async(req, res) => {
        const details = req.body;
        console.log(details)
        try {
            await pool.connect();
            const result = await pool.request()
                .input('email', details.email)
                .execute('UserLogin');

            if (result.recordset.length > 0) {
                const user = result.recordset[0];
                const match = await bcrypt.compare(details.passwords, user.password);
                console.log(match)

                if (match) {
                    console.log(user.id)
                    let token = await createToken({ email: user.email, id: user.id })
                    await pool.request()
                        .input('id', user.id)
                        .input('status', "active")
                        .execute('UpdateUserStatus');
                    res.json({ success: true, bearer: token, data: result.recordset[0] });
                } else {
                    res.status(401).json({ success: false, message: 'Invalid Credentials' });
                }
            } else {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error logging in' });
        }
    },
    getAUser: async(req, res) => {
        const { id } = req.params;
        try {
            await pool.connect();
            const result = await pool.request()
                .input("id", id).execute('GetUser');
            if (result.rowsAffected.length) res.json({ success: true, message: 'user retrieved successfully', data: result.recordset[0] })
        } catch (error) {
            res.status(500).json(`Get User Details Error: ${error}`);
        }

    },
    updateUser: async(req, res) => {
        const { fullname, department, profile, password, email, roles } = req.body;
        const { id } = req.params;
        try {
            await pool.connect();
            let hashed_pwd = await bcrypt.hash(password, 8)
            const result = await pool.request()
                .input("id", id)
                .input('fullname', fullname)
                .input('email', email)
                .input('profile', profile)
                .input('password', hashed_pwd)
                .input('department', department)
                .input('roles', roles)
                .execute('updateUser');
            if (result.rowsAffected.length) res.json({ success: true, message: 'user updated successfully', data: result.recordset })
        } catch (error) {
            console.log(error)
        }

    },
    SoftDeleteUser: async(req, res) => {
        const { id } = req.params
        try {
            await pool.connect();
            const result = await pool.request()
                .input("id", id).execute('RemoveUser');
            if (result.rowsAffected.length) res.json({ success: true, message: 'user deleted successfully' })
        } catch (error) {
            res.status(500).json(`Remove User Error: ${error}`);
        }

    },
    Logout: async(req, res) => {
        const { email } = req.params
        try {
            await pool.connect();
            const result = await pool.request()
                .input("emails", email)
                .input("status", "inactive")
                .execute('UpdateUserStatus');
            if (result.rowsAffected.length) res.json({ success: true, message: 'user Log Out successful' })
        } catch (error) {
            res.status(500).json(`Get Log Out Error: ${error}`);
        }
    },
    userAuthenticate: async(req, res) => {
        let token = req.headers["authorization"]
        token = token.split(" ")[1];
        try {
            let data = await verifyToken(token);
            res.json(data)
        } catch (error) {
            res.json(error)
        }
    }
}